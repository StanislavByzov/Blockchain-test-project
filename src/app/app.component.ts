import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import Web3 from 'web3';
import * as $ from 'jquery';
import Game from '../../build/contracts/Game.json';
import SafeMath from '../../build/contracts/SafeMath.json';
import Escrow from '../../build/contracts/Escrow.json';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {


    web3Provider: null;
    contracts: {};
    account: '0x0';
    hasVoted: false;
    web3: any;

    offX = 15;          // X offset from mouse position
    offY = 15;          // Y offset from mouse position

    constructor(public cdr: ChangeDetectorRef) {

    }

    ngOnInit(): void {
        window.addEventListener('resize', () => {
            this.resize();
        });
        const result = this.initWeb3();
        window.addEventListener('message', (event) => {

            if (~event.origin.indexOf('http://127.0.0.1')) {
                const message = event.data;
                if (message.message == 'Login') {
                    console.log(message);
                    this.login(message.value);
                }
            } else {

                return;
            }
        });
        result.then((response) => {
            console.log(response);
            this.contracts = response.contracts;
            this.getAccount();
            setTimeout(() => {
                this.sendIn("Iframe message");
            }, 2000);
        });

    };

    async initWeb3() {
        this.web3 = new Web3(Web3.givenProvider || 'ws://localhost:8545');
        const game = new this.web3.eth.Contract(Game.abi, '0x7799eEffcf21A00732Cf7B5FA246de75d8AA9fbb');
        const safeMath = new this.web3.eth.Contract(SafeMath.abi, '0x7183CDDE3Ebd29B363E13F63750407763F76e164');
        const accounts = await window['ethereum'].enable();

        this.web3.eth.defaultAccount = accounts[0];
        const result = {
            contracts:
            {
                Game: game,
                SafeMath: safeMath
            },
            web3: this.web3
        };
        return result;
    }

    getAccount() {
        this.account = this.web3.eth.defaultAccount;
        console.log(this.account);
    }

    login(playerName: string) {
        const contractAddress = '0x7799eEffcf21A00732Cf7B5FA246de75d8AA9fbb';
        this.contracts["Game"].methods.setAddress(contractAddress).send().then((res) => {
            console.log(res);
        }).catch(function (err) {
            console.error(err);
        });
        this.contracts["Game"].methods.login(playerName).send({ from: this.web3.eth.defaultAccount, value: 20000 }).then((res) => {
            console.log(res);
        }).catch(function (err) {
            console.error(err);
        });

        this.contracts["Game"].once('loginEvent', {
            filter: {},
            fromBlock: 0
        }, (error, event) => {
            console.log('Logged IN!');
            const message = {
                message: "Login OK",
                value: ""
            };
            this.sendIn(message);
            this.checkDeposit();
        });

    }

    checkDeposit() {
        const account = this.web3.eth.defaultAccount;
        this.contracts["Game"].methods.depositsOf(account).send().then((res) => {
            console.log(res);
        }).catch(function (err) {
            console.error(err);
        });

    }

    sendIn(messageObject) {
        var frame = document.getElementById('game-iframe');
        console.dir(frame);
        frame["contentWindow"].postMessage(messageObject, '*');
    }

    resize() {

        let message = {
            message: "Resize H",
            value: window.innerHeight - 5 + 'px'
        };
        this.sendIn(message);
        message = {
            message: "Resize W",
            value: window.innerWidth + 'px'
        };
        this.sendIn(message);
        document.getElementById("game-iframe").style.height = window.innerHeight - 5 + 'px';
    }
}

