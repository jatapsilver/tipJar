// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title TipJar – Un contrato para recibir propinas en ETH con un mensaje
/// @author Javier Alexander Plata Rueda
/// @notice Permite a cualquiera enviar una propina con un mensaje y al owner retirar fondos
contract TipJar {
    struct Tip {
        address from;
        uint256 amount;
        string message;
        uint256 timestamp;
    }

    // Dirección del owner) del contrato
    address public owner;

    // Array que almacena todas las propinas
    Tip[] public tips;

    // Evento que se emite por cada propina recibida
    event NewTip(
        address indexed from,
        uint256 amount,
        string message,
        uint256 timestamp
    );

    constructor() {
        owner = msg.sender;
    }

    function tip(string calldata _message) external payable {
        require(msg.value > 0, "Debes enviar ETH para dar propina");

        tips.push(Tip({
            from: msg.sender,
            amount: msg.value,
            message: _message,
            timestamp: block.timestamp
        }));

        emit NewTip(msg.sender, msg.value, _message, block.timestamp);
    }

    function withdraw() external {
        require(msg.sender == owner, "Solo el owner puede retirar las propinas");
        uint256 balance = address(this).balance;
        require(balance > 0, "No hay propinas para retirar");

        (bool success, ) = owner.call{ value: balance }("");
        require(success, "Transferencia fallida intentelo nuevamente");
    }

    function getTipCount() external view returns (uint256) {
        return tips.length;
    }

    function getAllTips() external view returns (Tip[] memory) {
        return tips;
    }
}
