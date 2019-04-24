import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import Web3 from 'web3';
import * as $ from 'jquery';
import Game from '../../build/contracts/Game.json';

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
        const accounts = await window['ethereum'].enable();

        this.web3.eth.defaultAccount = accounts[0];
        const result = {
            contracts:
            {
                Game: game
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
        // this.contracts["Game"].methods.login(playerName).send({ from: this.web3.eth.defaultAccount, value: 20 }).then((res) => {
        this.contracts["Game"].methods.login(playerName).send({ from: this.web3.eth.defaultAccount }).then((res) => {
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

        })

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

