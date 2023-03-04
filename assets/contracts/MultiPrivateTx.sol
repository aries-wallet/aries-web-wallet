// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MultiPrivateTx {
    address constant public privateAddr = address(0x0000000000000000000000000000000000000064);

    event Ota(string ota, uint256 value);
    
    function send(string[] calldata otas, uint256[] calldata values) external payable {
        require(otas.length == values.length, "length not match");
        for (uint256 i = 0; i < otas.length; i++) {
            bytes memory data = abi.encodeWithSignature("buyCoinNote(string,uint256)", otas[i], values[i]);
            callExternalContract(privateAddr, data, values[i]);
            emit Ota(otas[i], values[i]);
        }
    }

    function callExternalContract(address externalContract, bytes memory data, uint256 value) public payable returns (bytes memory) {
        bytes memory output;
        bool success;

        assembly {
            success := call(gas(), externalContract, value, add(data, 0x20), mload(data), 0, 0)
            let size := returndatasize()
            output := mload(0x40)
            mstore(output, size)
            returndatacopy(add(output, 0x20), 0, size)
        }

        require(success, "Call to external contract failed");
        return output;
    }
}

