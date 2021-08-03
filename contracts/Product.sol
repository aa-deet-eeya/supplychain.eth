// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

import "./Ownable.sol";

contract Product is Ownable {
    /*
     *  This denotes the Status of the Product
     *  there are currently 3 possible status
     *  Shipped: status when the Product is manufactured and shipped successfully
     *  Owner: When the product is successfully delivered to the owner
     *  Disposed: When the product is disposed
    */
    enum ProductStatus {
        Shipped, 
        Owned,
        Disposed 
    }

    /* 
     *  Info of the Product produced by the Manufacturer
     *  owner: current owner address
     *  recipient: address of whom this product is to be delivered to
     *  creationTime: timestamp of when the Product was created
     *  nTransferred: how many times the product has been transferred
     *  status: This keeps the status of the product
    */
    struct ProductInfo {
        address owner;
        address recipient;
        uint256 creationTime;
        uint256 nTransferred;
        ProductStatus status;
    }
    
    mapping (uint256 => ProductInfo) products;

        
    /* 
     *  Info of the Manufacturer
     *  companyName: Name of the Company
     *  companyPrefix: A no. which uniquely identifies the Company
     *  expiryTime: Company registration expiration time
    */
    struct ManufacturerInfo {
        bytes32 companyName;
        uint256 companyPrefix;
        uint256 expireTime;
    }
    
    /*
     *  Keeps the mappings of manufacturer address to their info 
    */
    mapping (address => ManufacturerInfo) _manufacturers;
    
    
    /*
     *  Kepps the mappings of companyPrefix to Address
    */
    mapping (uint256 => address) _companyPrefixToAddress;

    /*
     * Keeps track of electronicProductCode to companyPrefix
    */
    mapping (uint256 => uint256) _EPCtoCompanyPrefix;

    /*
     *  Event Emitted when a Manufacturer is succesfully registered to the blockchain
    */
    event ManufacturerCreated (
        bytes32 companyName,
        uint256 companyPrefix,
        uint256 expireTime
    );

    /*
     *  Event Emitted when a Product is succesfully created by a registered Manufacturer
    */
    event ProductCreated (
        uint256 _EPC,
        address owner,
        uint256 createdAt
    );

    /*
     *  Event Emitted when a Product status is changed
    */
    event ProductStatusEvent (
        string status
    );
    

    /*
     *  modifier to Check if the Manufacturer is registered with the blockchain or not 
    */
    modifier onlyManufacturer() {
        ManufacturerInfo memory _info = _manufacturers[msg.sender];
        require(_info.companyName != bytes32(0x0), 'Manufacturer Doesnt Exist');
        _;
    }

    /*
     *  modifier to Check if a product (EPC) is already NOT registered or not 
    */
    modifier onlyNotExist(uint256 _EPC) {
        uint256 _companyPrefix = getCompanyPrefix(_EPC);
        require(_companyPrefix == 0, 'EPC exists');
        _;
    }

    /*
     *  modifier to check if the product (EPC) is already registered or not
    */
    modifier onlyExist(uint256 _EPC) {
        uint256 _companyPrefix = getCompanyPrefix(_EPC);
        require(_companyPrefix != 0, "EPC doesn't exist");
        _;
    }

    /*
     *  modifier to check the product (EPC) status
    */
    modifier onlyStatusIs(uint256 _EPC, ProductStatus _status) {
        ProductInfo memory _product = products[_EPC];
        require(_product.status == _status, "Wrong Status");
        _;
    }

    /*
     *  modifier to check if the sender is product owner or not
    */
    modifier onlyProductOwner(uint256 _EPC) {
       ProductInfo memory _product = products[_EPC];
       require(_product.owner == msg.sender, "Sender not the Owner of the Product");
       _;
    }

    /*
     *  modifier to check if the sender is product's expected recipient or not
    */
    modifier onlyRecipient(uint256 _EPC) {
        ProductInfo memory _product = products[_EPC];
        require(_product.recipient == msg.sender, "The product wasn't meant for the sender");
        _;
    }

    /*
     *  Registers a Manufacturer with the blockchain
     *  @params
     *  _manufacturerAddress: address of the manufacturer
     *  _companyPrefix: Unique prefix assigned by the Admin
     *  _companyName: Name of the company
     *  _validityTime: Time for which the company is valid in the blockchain
     *  
     *  @emits
     *  ManufacturerCreated event
    */
    function enrollManufacturer(
      address _manufacturerAddress,
      uint256 _companyPrefix,
      bytes32 _companyName,
      uint256 _validityTime
    ) external onlyOwner {
      ManufacturerInfo memory _info = ManufacturerInfo(
        _companyName,
        _companyPrefix,
        block.timestamp + _validityTime
      );

      _manufacturers[_manufacturerAddress] = _info;

      emit ManufacturerCreated(_companyName, _companyPrefix, _info.expireTime);
    }

    /*
     *  Registers a Product with the blockchain
     *  @params
     *  _EPC: electronic product code (EPC) of the Product
     *  
     *  @emits
     *  ProductCreated event
    */
    function enrollProduct(uint256 _EPC) onlyNotExist(_EPC) onlyManufacturer() external {
        ManufacturerInfo memory _info = _manufacturers[msg.sender];
        _EPCtoCompanyPrefix[_EPC] = _info.companyPrefix;
        _companyPrefixToAddress[_info.companyPrefix] = msg.sender;

        products[_EPC].owner = msg.sender;
        products[_EPC].status = ProductStatus.Owned;
        products[_EPC].creationTime = block.timestamp;
        products[_EPC].nTransferred = 0;

        emit ProductCreated(_EPC, msg.sender, products[_EPC].creationTime);
    }

    /*
     *  Ships the Product
     *  @params
     *  _recipient: address of the expected recipient of the product
     *  _EPC: Electronic Product Code of the Product
    */
    function shipProduct(address _recipient, uint256 _EPC) 
    onlyExist(_EPC) onlyProductOwner(_EPC) onlyStatusIs(_EPC, ProductStatus.Owned) external {
        require(msg.sender == products[_EPC].owner, "Sender is not the Owner");
        
        products[_EPC].status = ProductStatus.Shipped;
        products[_EPC].recipient = _recipient;
    }
    
    /*
     *  Recieve the Product
     *  @params
     *  _EPC: Electronic Product Code of the Product
    */
    function receiveProduct(uint256 _EPC) onlyExist(_EPC) 
    onlyRecipient(_EPC) onlyStatusIs(_EPC, ProductStatus.Shipped) external {
        products[_EPC].owner = msg.sender;
        products[_EPC].status = ProductStatus.Owned;
        products[_EPC].nTransferred = products[_EPC].nTransferred + 1;
    }

    /*
     *  Getter function for Product's current Owner
    */
    function getCurrentOwner(uint256 _EPC) onlyExist(_EPC) external view returns (address) {
        return products[_EPC].owner;
    }

    /*
     *  Getter function for Product's current Reciepient
    */
    function getRecipient(uint256 _EPC) 
    onlyExist(_EPC) onlyStatusIs(_EPC, ProductStatus.Shipped) external view returns (address) {
        return products[_EPC].recipient;
    }

    /*
     *  Getter function for Product's current status
     *
     *  @emits
     *  ProductStatus event
    */
    function getProductStatus(uint256 _EPC) onlyExist(_EPC) external {
        if (products[_EPC].status == ProductStatus.Owned) {
            emit ProductStatusEvent("Owned");
        } else if (products[_EPC].status == ProductStatus.Shipped) {
            emit ProductStatusEvent("Shipped");
        } else {
            emit ProductStatusEvent("Disposed");
        }
    }

    /*
     *  Getter function for Product's Manufacturer Address
    */    
    function getManufacturerAddress(uint256 _EPC) onlyExist(_EPC) view public returns(address) {
        uint256 _companyPrefix = _EPCtoCompanyPrefix[_EPC];
        
        return _companyPrefixToAddress[_companyPrefix];
    }

    /*
     *  Getter function for Product's Manufacturer Name
    */  
    function getCompanyName(uint256 _EPC) onlyExist(_EPC) view public returns(bytes32) {
        address _manufacturerAddress = _companyPrefixToAddress[_EPCtoCompanyPrefix[_EPC]];
        ManufacturerInfo memory _info = _manufacturers[_manufacturerAddress];

        return _info.companyName;
    }

    /*
     *  Getter function for Product's CompanyPrefix
    */ 
    function getCompanyPrefix(uint256 _EPC) view public returns(uint256) {
      return _EPCtoCompanyPrefix[_EPC];
    }

}
