pragma solidity >=0.6.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./MyToken.sol";

// https://youtu.be/o9Ux3xDrkIo

contract Escrow is Ownable {

    enum OrderStatus { Pending, Settled, Refused, Canceled }

    event OrderUpdate(uint indexed orderId, address indexed seller, address indexed buyer, uint quantity, uint settlementAmount, OrderStatus status);

    struct Order {
        uint orderId;
        address payable seller;
        address payable buyer;
        uint quantity;
        uint settlementAmount;
        OrderStatus status;
        bool refundApproved;
    }

    uint public orderCount = 0;

    mapping(uint => Order) public orders;
    address public myTokenAddress;

    constructor(
        address _myTokenAddress
    ) public {
        myTokenAddress = _myTokenAddress;
    }

    function initMyTokenAddress(address _myTokenAddress) external onlyOwner {
        myTokenAddress = _myTokenAddress;
    }

    function getOrder(uint _orderId) view public returns (uint, address, address, uint, uint, OrderStatus, bool) {
        return (orders[_orderId].orderId, orders[_orderId].seller, orders[_orderId].buyer, orders[_orderId].quantity, orders[_orderId].settlementAmount, orders[_orderId].status, orders[_orderId].refundApproved);
    }

    function getMyTokenAddress() view public returns (address) {
        return myTokenAddress;
    }

    // initiated by seller
    function createOrder(address payable _buyer, uint _quantity, uint _settlementAmount) external returns (bool) {
        orderCount ++;
        orders[orderCount] = Order(orderCount, msg.sender, _buyer, _quantity,  _settlementAmount, OrderStatus.Pending, false);
        // (bool success, bytes memory result) = address(myToken).delegatecall(abi.encodeWithSignature("approve(address,uint256)", address(this), _value));
        require(myTokenAddress != address(0), "ERC20 has zero address");
        MyToken(myTokenAddress).approve(address(this), _quantity);
        MyToken(myTokenAddress).transferFrom(msg.sender, address(this), _quantity);
        emit OrderUpdate(orderCount, msg.sender, _buyer, _quantity, _settlementAmount, OrderStatus.Pending);
        return true;
    }

    // initiated by buyer
    function acceptOrder(uint _orderId, address payable _receiver) external payable {
        Order storage order = orders[_orderId];
        assert(order.buyer == msg.sender);
        assert(order.seller == _receiver);
        require(order.settlementAmount * 1000000000000000000 == msg.value, "Wrong settlementAmount");
        
        order.status = OrderStatus.Settled;
        // address(myToken).delegatecall(abi.encodeWithSignature("transfer(address,uint256)", address(this), order.value));
        MyToken(myTokenAddress).transfer(msg.sender, order.quantity);
        _receiver.transfer(msg.value);
        // _receiver.transfer(order.settlementAmount);
        emit OrderUpdate(_orderId, order.seller, msg.sender, order.quantity, order.settlementAmount, OrderStatus.Settled);
    }

    function refuseOrder(uint _orderId, address _seller) external {
        Order storage order = orders[_orderId];
        assert(order.buyer == msg.sender);
        assert(order.seller == _seller);
        order.status = OrderStatus.Refused;
        MyToken(myTokenAddress).transfer(_seller, order.quantity);
        emit OrderUpdate(_orderId, order.seller, order.buyer, order.quantity, order.settlementAmount, OrderStatus.Refused);
    }

    function cancelOrder(uint _orderId) external {
        Order storage order = orders[_orderId];
        assert(order.seller == msg.sender);
        order.status = OrderStatus.Canceled;
        MyToken(myTokenAddress).transfer(msg.sender, order.quantity);
        emit OrderUpdate(_orderId, order.seller, order.buyer, order.quantity, order.settlementAmount, OrderStatus.Canceled);
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