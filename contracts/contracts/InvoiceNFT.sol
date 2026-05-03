// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title InvoiceNFT
 * @notice 供應鏈發票 NFT 合約
 * @dev 將物流單據鑄造為 ERC-721 NFT，實現不可竄改的溯源記錄
 */
contract InvoiceNFT is ERC721URIStorage, AccessControl {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    
    // 角色定義
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");      // 發行人
    bytes32 public constant LOGISTICS_ROLE = keccak256("LOGISTICS_ROLE"); // 物流商
    bytes32 public constant BANK_ROLE = keccak256("BANK_ROLE");          // 銀行
    
    // Stablecoin 地址
    address public stableCoinAddress;
    
    // 發票狀態枚舉
    enum InvoiceStatus {
        Created,        // 已創建
        InTransit,      // 運輸中
        CustomClearance,// 清關中
        Delivered,     // 已送達
        Financing,     // 融资中
        Repaid,         // 已還款
        Defaulted       // 違約
    }
    
    // NFT 結構
    struct Invoice {
        uint256 tokenId;
        address issuer;
        uint256 amount;
        string shipmentId;
        InvoiceStatus status;
        string[] nodeHistory;
        uint256 createdAt;
        uint256 maturityDate;
    }
    
    mapping(uint256 => Invoice) public invoices;
    mapping(uint256 => address) public invoiceToLender;
    mapping(uint256 => uint256) public loanAmounts;
    mapping(uint256 => uint256) public loanInterest;
    
    event InvoiceCreated(uint256 indexed tokenId, address indexed issuer, uint256 amount);
    event StatusUpdated(uint256 indexed tokenId, InvoiceStatus newStatus, string node);
    event FinancingRequested(uint256 indexed tokenId, uint256 amount);
    event LoanDisbursed(uint256 indexed tokenId, address indexed lender, uint256 amount);
    event LoanRepaid(uint256 indexed tokenId);
    event DefaultTriggered(uint256 indexed tokenId);
    
    constructor() ERC721("InvoiceNFT", "INVOICE") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ISSUER_ROLE, msg.sender);
    }
    
    function createInvoice(
        address recipient,
        uint256 amount,
        string memory shipmentId,
        uint256 maturityDate,
        string memory uri
    ) external onlyRole(ISSUER_ROLE) returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _mint(recipient, newTokenId);
        _setTokenURI(newTokenId, uri);
        
        Invoice storage invoice = invoices[newTokenId];
        invoice.tokenId = newTokenId;
        invoice.issuer = recipient;
        invoice.amount = amount;
        invoice.shipmentId = shipmentId;
        invoice.status = InvoiceStatus.Created;
        invoice.createdAt = block.timestamp;
        invoice.maturityDate = maturityDate;
        
        emit InvoiceCreated(newTokenId, recipient, amount);
        return newTokenId;
    }
    
    function updateLogisticsStatus(
        uint256 tokenId,
        InvoiceStatus newStatus,
        string memory nodeInfo
    ) external onlyRole(LOGISTICS_ROLE) {
        require(ownerOf(tokenId) != address(0), "Invoice does not exist");
        
        Invoice storage invoice = invoices[tokenId];
        invoice.status = newStatus;
        invoice.nodeHistory.push(nodeInfo);
        
        emit StatusUpdated(tokenId, newStatus, nodeInfo);
    }
    
    function requestFinancing(uint256 tokenId, uint256 loanAmount) external onlyRole(BANK_ROLE) {
        Invoice storage invoice = invoices[tokenId];
        require(invoice.status == InvoiceStatus.Delivered, "Invoice not ready for financing");
        require(loanAmount <= invoice.amount * 80 / 100, "Loan exceeds 80%");
        
        invoice.status = InvoiceStatus.Financing;
        emit FinancingRequested(tokenId, loanAmount);
    }
    
    function getInvoice(uint256 tokenId) external view returns (Invoice memory) {
        return invoices[tokenId];
    }
    
    function getNodeHistory(uint256 tokenId) external view returns (string[] memory) {
        return invoices[tokenId].nodeHistory;
    }
    
    // Override required by Solidity
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    function _burn(uint256 tokenId) internal override(ERC721URIStorage) {
        super._burn(tokenId);
    }
}
