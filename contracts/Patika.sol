//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "erc721a/contracts/ERC721A.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/*
Patika.sol
*/

contract Patika is Ownable, ERC721A {
    bytes32 public merkleRoot =
        0x18005ffd485d367fd31307e229607a9b05802e8b57c418d4c818a47152c02b83;

    uint256 public constant MAX_SUPPLY = 20;
    uint256 public ALLOW_LIST_MAX = 5;
    uint256 public TEAM_MINT_MAX = 5;

    uint256 public constant ALLOW_LIST_PRICE = 0.001 ether;
    uint256 public PUBLIC_PRICE = 0.001 ether;

    uint256 public constant PUBLIC_MINT_LIMIT_TXN = 10;
    uint256 public constant PUBLIC_MINT_LIMIT = 10;

    uint256 public TOTAL_SUPPLY_TEAM;

    string public revealedURI;

    string public hiddenURI =
        "ipfs://QmdtU7yAyVy456DtsWFx7mJ7PT1EgokRRkr8YgFYPBT9yb";
    string public CONTRACT_URI =
        "ipfs://QmdtU7yAyVy456DtsWFx7mJ7PT1EgokRRkr8YgFYPBT9yb";

    bool public paused = true;
    bool public revealed = false;
    bool public allowListSale = true;
    bool public publicSale = false;

    address internal constant devWallet =
        0x11c0a0ffB68a455A0d7da100803c1bEcF82b4aB5;
    address public teamWallet = 0x15f01D94d5416dCc42081016Fcd1669c5C0fed11;

    uint256 internal devWithdrawPercent = 4000;

    mapping(address => uint256) public numUserMints; // user => numMints (public)
    mapping(address => bool) public userMintedAllowList; // user => minted (allow list)

    constructor() ERC721A("Patika", "PTK") {}

    /*
     *

    $$$$$$$\            $$\                      $$\                     $$$$$$$$\                              $$\     $$\                               
    $$  __$$\           \__|                     $$ |                    $$  _____|                             $$ |    \__|                              
    $$ |  $$ | $$$$$$\  $$\ $$\    $$\ $$$$$$\ $$$$$$\    $$$$$$\        $$ |   $$\   $$\ $$$$$$$\   $$$$$$$\ $$$$$$\   $$\  $$$$$$\  $$$$$$$\   $$$$$$$\ 
    $$$$$$$  |$$  __$$\ $$ |\$$\  $$  |\____$$\\_$$  _|  $$  __$$\       $$$$$\ $$ |  $$ |$$  __$$\ $$  _____|\_$$  _|  $$ |$$  __$$\ $$  __$$\ $$  _____|
    $$  ____/ $$ |  \__|$$ | \$$\$$  / $$$$$$$ | $$ |    $$$$$$$$ |      $$  __|$$ |  $$ |$$ |  $$ |$$ /        $$ |    $$ |$$ /  $$ |$$ |  $$ |\$$$$$$\  
    $$ |      $$ |      $$ |  \$$$  / $$  __$$ | $$ |$$\ $$   ____|      $$ |   $$ |  $$ |$$ |  $$ |$$ |        $$ |$$\ $$ |$$ |  $$ |$$ |  $$ | \____$$\ 
    $$ |      $$ |      $$ |   \$  /  \$$$$$$$ | \$$$$  |\$$$$$$$\       $$ |   \$$$$$$  |$$ |  $$ |\$$$$$$$\   \$$$$  |$$ |\$$$$$$  |$$ |  $$ |$$$$$$$  |
    \__|      \__|      \__|    \_/    \_______|  \____/  \_______|      \__|    \______/ \__|  \__| \_______|   \____/ \__| \______/ \__|  \__|\_______/ 

    *
    */

    // verify if the user is on the allow list
    function _verifyPublicAllowList(bytes32[] memory _proof, bytes32 _root)
        internal
        view
        returns (bool)
    {
        return
            MerkleProof.verify(
                _proof,
                _root,
                keccak256(abi.encodePacked(msg.sender))
            );
    }

    // refund if the user not enough balance
    function refundOverpay(uint256 price) private {
        if (msg.value > price) {
            (bool succ, ) = payable(msg.sender).call{
                value: (msg.value - price)
            }("");
            require(succ, "Transfer failed");
        } else if (msg.value < price) {
            revert("Not enough ETH sent");
        }
    }

    /*
     *

    $$$$$$$\            $$\       $$\ $$\                 $$$$$$$$\                              $$\     $$\                               
    $$  __$$\           $$ |      $$ |\__|                $$  _____|                             $$ |    \__|                              
    $$ |  $$ |$$\   $$\ $$$$$$$\  $$ |$$\  $$$$$$$\       $$ |   $$\   $$\ $$$$$$$\   $$$$$$$\ $$$$$$\   $$\  $$$$$$\  $$$$$$$\   $$$$$$$\ 
    $$$$$$$  |$$ |  $$ |$$  __$$\ $$ |$$ |$$  _____|      $$$$$\ $$ |  $$ |$$  __$$\ $$  _____|\_$$  _|  $$ |$$  __$$\ $$  __$$\ $$  _____|
    $$  ____/ $$ |  $$ |$$ |  $$ |$$ |$$ |$$ /            $$  __|$$ |  $$ |$$ |  $$ |$$ /        $$ |    $$ |$$ /  $$ |$$ |  $$ |\$$$$$$\  
    $$ |      $$ |  $$ |$$ |  $$ |$$ |$$ |$$ |            $$ |   $$ |  $$ |$$ |  $$ |$$ |        $$ |$$\ $$ |$$ |  $$ |$$ |  $$ | \____$$\ 
    $$ |      \$$$$$$  |$$$$$$$  |$$ |$$ |\$$$$$$$\       $$ |   \$$$$$$  |$$ |  $$ |\$$$$$$$\   \$$$$  |$$ |\$$$$$$  |$$ |  $$ |$$$$$$$  |
    \__|       \______/ \_______/ \__|\__| \_______|      \__|    \______/ \__|  \__| \_______|   \____/ \__| \______/ \__|  \__|\_______/ 

    *
    */

    // pre-sale mint function
    function allowListMint(bytes32[] memory proof)
        external
        payable
        mintCompliance(1)
    {
        require(allowListSale, "allow List sale inactive");
        require(_verifyPublicAllowList(proof, merkleRoot), "User not on WL");

        uint256 price = ALLOW_LIST_PRICE;

        require(!userMintedAllowList[msg.sender], "User already minted WL");

        refundOverpay(price);

        userMintedAllowList[msg.sender] = true;

        _safeMint(msg.sender, 1);
    }

    // team mint function
    function teamMint(uint256 quantity)
        public
        payable
        mintCompliance(quantity)
    {
        require(msg.sender == teamWallet, "Team minting only");
        require(
            TOTAL_SUPPLY_TEAM + quantity <= TEAM_MINT_MAX,
            "No team mints left"
        );
        require(totalSupply() >= 5, "Team mints after public sale");

        TOTAL_SUPPLY_TEAM += quantity;

        _safeMint(msg.sender, quantity);
    }

    // public mint function
    function publicMint(uint256 quantity)
        external
        payable
        mintCompliance(quantity)
    {
        require(publicSale, "Public sale inactive");
        require(quantity <= PUBLIC_MINT_LIMIT_TXN, "Quantity too high");

        uint256 price = PUBLIC_PRICE;
        uint256 currMints = numUserMints[msg.sender];

        require(
            currMints + quantity <= PUBLIC_MINT_LIMIT,
            "User max mint limit"
        );

        refundOverpay(price * quantity);

        numUserMints[msg.sender] = (currMints + quantity);

        _safeMint(msg.sender, quantity);
    }

    /*
     *

    $$\    $$\ $$\                               $$$$$$$$\                              $$\     $$\                               
    $$ |   $$ |\__|                              $$  _____|                             $$ |    \__|                              
    $$ |   $$ |$$\  $$$$$$\  $$\  $$\  $$\       $$ |   $$\   $$\ $$$$$$$\   $$$$$$$\ $$$$$$\   $$\  $$$$$$\  $$$$$$$\   $$$$$$$\ 
    \$$\  $$  |$$ |$$  __$$\ $$ | $$ | $$ |      $$$$$\ $$ |  $$ |$$  __$$\ $$  _____|\_$$  _|  $$ |$$  __$$\ $$  __$$\ $$  _____|
     \$$\$$  / $$ |$$$$$$$$ |$$ | $$ | $$ |      $$  __|$$ |  $$ |$$ |  $$ |$$ /        $$ |    $$ |$$ /  $$ |$$ |  $$ |\$$$$$$\  
      \$$$  /  $$ |$$   ____|$$ | $$ | $$ |      $$ |   $$ |  $$ |$$ |  $$ |$$ |        $$ |$$\ $$ |$$ |  $$ |$$ |  $$ | \____$$\ 
       \$  /   $$ |\$$$$$$$\ \$$$$$\$$$$  |      $$ |   \$$$$$$  |$$ |  $$ |\$$$$$$$\   \$$$$  |$$ |\$$$$$$  |$$ |  $$ |$$$$$$$  |
        \_/    \__| \_______| \_____\____/       \__|    \______/ \__|  \__| \_______|   \____/ \__| \______/ \__|  \__|\_______/ 

    *
    */

    // owned token Id to address mapping for easy transfer of ownership of tokens
    function walletOfOwner(address _owner)
        public
        view
        returns (uint256[] memory)
    {
        uint256 ownerTokenCount = balanceOf(_owner);
        uint256[] memory ownedTokenIds = new uint256[](ownerTokenCount);
        uint256 currentTokenId = 1;
        uint256 ownedTokenIndex = 0;

        while (
            ownedTokenIndex < ownerTokenCount && currentTokenId <= MAX_SUPPLY
        ) {
            address currentTokenOwner = ownerOf(currentTokenId);

            if (currentTokenOwner == _owner) {
                ownedTokenIds[ownedTokenIndex] = currentTokenId;

                ownedTokenIndex++;
            }

            currentTokenId++;
        }

        return ownedTokenIds;
    }

    // token URI for each token ID (metadata)
    function tokenURI(uint256 _tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(
            _exists(_tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );

        if (revealed) {
            return
                string(
                    abi.encodePacked(
                        revealedURI,
                        Strings.toString(_tokenId),
                        ".json"
                    )
                );
        } else {
            return hiddenURI;
        }
    }

    // https://docs.opensea.io/docs/contract-level-metadata
    // https://ethereum.stackexchange.com/questions/110924/how-to-properly-implement-a-contracturi-for-on-chain-nfts
    function contractURI() public view returns (string memory) {
        return CONTRACT_URI;
    }

    // verify proof of public allow list
    function verifyPublicAllowList(
        address _address,
        bytes32[] memory _proof,
        bytes32 _root
    ) public pure returns (bool) {
        return
            MerkleProof.verify(
                _proof,
                _root,
                keccak256(abi.encodePacked(_address))
            );
    }

    /*
     *

     $$$$$$\                                                    $$$$$$$$\                              $$\     $$\                               
    $$  __$$\                                                   $$  _____|                             $$ |    \__|                              
    $$ /  $$ |$$\  $$\  $$\ $$$$$$$\   $$$$$$\   $$$$$$\        $$ |   $$\   $$\ $$$$$$$\   $$$$$$$\ $$$$$$\   $$\  $$$$$$\  $$$$$$$\   $$$$$$$\ 
    $$ |  $$ |$$ | $$ | $$ |$$  __$$\ $$  __$$\ $$  __$$\       $$$$$\ $$ |  $$ |$$  __$$\ $$  _____|\_$$  _|  $$ |$$  __$$\ $$  __$$\ $$  _____|
    $$ |  $$ |$$ | $$ | $$ |$$ |  $$ |$$$$$$$$ |$$ |  \__|      $$  __|$$ |  $$ |$$ |  $$ |$$ /        $$ |    $$ |$$ /  $$ |$$ |  $$ |\$$$$$$\  
    $$ |  $$ |$$ | $$ | $$ |$$ |  $$ |$$   ____|$$ |            $$ |   $$ |  $$ |$$ |  $$ |$$ |        $$ |$$\ $$ |$$ |  $$ |$$ |  $$ | \____$$\ 
     $$$$$$  |\$$$$$\$$$$  |$$ |  $$ |\$$$$$$$\ $$ |            $$ |   \$$$$$$  |$$ |  $$ |\$$$$$$$\   \$$$$  |$$ |\$$$$$$  |$$ |  $$ |$$$$$$$  |
     \______/  \_____\____/ \__|  \__| \_______|\__|            \__|    \______/ \__|  \__| \_______|   \____/ \__| \______/ \__|  \__|\_______/ 

     *
     */

    // set merkle root
    function setMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        merkleRoot = _merkleRoot;
    }

    // set pre-sale max mint limit
    function setAllowListMax(uint256 _allowListMax) public onlyOwner {
        ALLOW_LIST_MAX = _allowListMax;
    }

    // set team max mint limit
    function setTeamMintMax(uint256 _teamMintMax) public onlyOwner {
        TEAM_MINT_MAX = _teamMintMax;
    }

    // set public mint price
    function setPublicPrice(uint256 _publicPrice) public onlyOwner {
        PUBLIC_PRICE = _publicPrice;
    }

    // set dev percent
    function setDevWithdrawCut(uint256 _devPercentage) public onlyOwner {
        devWithdrawPercent = _devPercentage;
    }

    // set revealed URI
    function setBaseURI(string memory _baseUri) public onlyOwner {
        revealedURI = _baseUri;
    }

    // set hidden URI
    // Note: This method can be hidden/removed if this is a constant.
    function setHiddenMetadataURI(string memory _hiddenMetadataUri)
        public
        onlyOwner
    {
        hiddenURI = _hiddenMetadataUri;
    }

    // set revealed state
    function revealCollection(bool _revealed, string memory _baseUri)
        public
        onlyOwner
    {
        revealed = _revealed;
        revealedURI = _baseUri;
    }

    // set contract URI
    function setContractURI(string memory _contractURI) public onlyOwner {
        CONTRACT_URI = _contractURI;
    }

    // set pause state
    // https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/security/Pausable.sol
    function setPaused(bool _state) public onlyOwner {
        paused = _state;
    }

    // set revealed state
    function setRevealed(bool _state) public onlyOwner {
        revealed = _state;
    }

    // set public sale state
    function setPublicEnabled(bool _state) public onlyOwner {
        publicSale = _state;
    }

    // set pre-sale state
    function setAllowListEnabled(bool _state) public onlyOwner {
        allowListSale = _state;
    }

    // set team wallet address
    function setTeamWalletAddress(address _teamWallet) public onlyOwner {
        teamWallet = _teamWallet;
    }

    // withdraw funds percentage to dev wallet address and team wallet address
    function withdraw() external payable onlyOwner {
        // Get the current funds to calculate initial percentages
        uint256 currBalance = address(this).balance;

        (bool succ, ) = payable(devWallet).call{
            value: (currBalance * devWithdrawPercent) / 10000
        }("");
        require(succ, "Dev transfer failed");

        // Withdraw the ENTIRE remaining balance to the team wallet
        (succ, ) = payable(teamWallet).call{value: address(this).balance}("");
        require(succ, "Team (remaining) transfer failed");
    }

    // Owner-only mint functionality to "Airdrop" mints to specific users
    // Note: These will likely end up hidden on OpenSea
    function mintToUser(uint256 quantity, address receiver)
        public
        onlyOwner
        mintCompliance(quantity)
    {
        _safeMint(receiver, quantity);
    }

    /*
     *

    $$\      $$\                 $$\ $$\  $$$$$$\  $$\                               
    $$$\    $$$ |                $$ |\__|$$  __$$\ \__|                              
    $$$$\  $$$$ | $$$$$$\   $$$$$$$ |$$\ $$ /  \__|$$\  $$$$$$\   $$$$$$\   $$$$$$$\ 
    $$\$$\$$ $$ |$$  __$$\ $$  __$$ |$$ |$$$$\     $$ |$$  __$$\ $$  __$$\ $$  _____|
    $$ \$$$  $$ |$$ /  $$ |$$ /  $$ |$$ |$$  _|    $$ |$$$$$$$$ |$$ |  \__|\$$$$$$\  
    $$ |\$  /$$ |$$ |  $$ |$$ |  $$ |$$ |$$ |      $$ |$$   ____|$$ |       \____$$\ 
    $$ | \_/ $$ |\$$$$$$  |\$$$$$$$ |$$ |$$ |      $$ |\$$$$$$$\ $$ |      $$$$$$$  |
    \__|     \__| \______/  \_______|\__|\__|      \__| \_______|\__|      \_______/ 

    *
    */

    // modifier to check if the contract is paused and total supply is less than max supply
    modifier mintCompliance(uint256 quantity) {
        require(!paused, "Contract is paused");
        require(
            totalSupply() + quantity <= MAX_SUPPLY,
            "Not enough mints left"
        );
        require(tx.origin == msg.sender, "No contract minting");
        _;
    }
}
