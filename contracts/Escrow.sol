pragma solidity >=0.6.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./MyToken.sol";

// https://youtu.be/o9Ux3xDrkIo

contract Escrow is Ownable {

    enum OrderStatus { Pending, Accept, Completed, Refunded }

    event OrderUpdate(uint indexed orderId, address indexed seller, address indexed buyer, uint value, OrderStatus status);

    struct Order {
        uint orderId;
        address seller;
        address buyer;
        uint value;
        OrderStatus status;
        bool refundApproved;
    }

    mapping(uint => Order) public orders;
    // ERC20 public myToken;
    address public myTokenAddress;
    // address public collectionAddress;
    // Webshop public webshop;

    constructor(
        address _myTokenAddress
    ) public {
        myTokenAddress = _myTokenAddress;
        // myToken = MyToken(_myTokenAddress);
        // collectionAddress = _collectionAddress;
        // webshop = Webshop(msg.sender);
    }

    function updateMyToken(address _myTokenAddress) external onlyOwner {
        myTokenAddress = _myTokenAddress;
        // myToken = MyToken(_myTokenAddress);
        // myToken = MyToken(_myTokenAddress);
    }

    function getOrder(uint _orderId) public returns (uint, address, address, uint, OrderStatus, bool) {
        return (orders[_orderId].orderId, orders[_orderId].seller, orders[_orderId].buyer, orders[_orderId].value, orders[_orderId].status, orders[_orderId].refundApproved);
    }

        function getMyTokenAddress() public returns (address) {
        return myTokenAddress;
    }

    function createOrder(uint _orderId, address _buyer, uint _value) external returns (bool) {
        orders[_orderId] = Order(_orderId, msg.sender, _buyer, _value, OrderStatus.Pending, false);
        // (bool success, bytes memory result) = address(myToken).delegatecall(abi.encodeWithSignature("approve(address,uint256)", address(this), _value));
        require(myTokenAddress != address(0), "ERC20 has zero address");
        MyToken(myTokenAddress).test(address(this), _value);
        // emit OrderUpdate(_orderId, msg.sender, _buyer, _value, OrderStatus.Pending);
        emit OrderUpdate(_orderId, address(this), myTokenAddress, _value, OrderStatus.Pending);
        return true;
    }

    function acceptOrder(uint _orderId) external {
        Order storage order = orders[_orderId];
        assert(order.buyer == msg.sender);
        
        order.status = OrderStatus.Completed;
        // address(myToken).delegatecall(abi.encodeWithSignature("transfer(address,uint256)", address(this), order.value));
        MyToken(myTokenAddress).transfer(address(this), order.value);
        emit OrderUpdate(_orderId, order.seller, msg.sender, order.value, OrderStatus.Completed);
    }

    // function release(uint _orderId) external {
    //     completeOrder(_orderId, collectionAddress, PaymentStatus.Completed);
    // }

    // function refund(uint _orderId) external {
    //     completePayment(_orderId, msg.sender, PaymentStatus.Refunded);
    // }

    // function approveRefund(uint _orderId) external {
    //     require(msg.sender == collectionAddress);
    //     Payment storage payment = payments[_orderId];
    //     payment.refundApproved = true;
    // }

    // function completeOrder(uint _orderId, address _receiver, PaymentStatus _status) private {
    //     Payment storage payment = payments[_orderId];
    //     require(payment.customer == msg.sender);
    //     require(payment.status == PaymentStatus.Pending);
    //     if (_status == PaymentStatus.Refunded) {
    //         require(payment.refundApproved);
    //     }
    //     myToken.transfer(_receiver, payment.value);
    //     // webshop.changeOrderStatus(_orderId, Webshop.OrderStatus.Completed);
    //     payment.status = _status;
    //     emit PaymentCompletion(_orderId, payment.customer, payment.value, _status);
    // }

}