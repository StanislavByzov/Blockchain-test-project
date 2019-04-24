# Blockchain-game-project
First public version

1. Ganache is running with default options at HTTP://127.0.0.1:7545, truffle-config is linked
2. Start with "truffle migrate" (or "truffle migrate --reset" for resets)
3. Find line "> contract address:  (example address)  0x7799eEffcf21A00732Cf7B5FA246de75d8AA9fbb" in logs and copy this address for Game contract
4. Replace the address in line 58 of app.component.ts (const game = new this.web3.eth.Contract(Game.abi, 0x7799eEffcf21A00732Cf7B5FA246de75d8AA9fbb');)
5. Run "npm start" for node.js server
6. Import one of Ganache accounts to Metamask, connect to HTTP://127.0.0.1:7545
7. Run "npm start" for Angular client
8. Follow HTTP://127.0.0.1:4200 in Chrome