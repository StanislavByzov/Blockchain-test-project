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

        const result = this.initWeb3();
        window.addEventListener('message', (event) => {

            if (~event.origin.indexOf('http://127.0.0.1')) {
                const message = event.data;
                console.log(message);
                if (message == 'Login') {
                    this.login();
                }
            } else {

                return;
            }
        });
        result.then((response) => {
            console.log(response);
            this.contracts = response.contracts;
            this.listenForEvents();
            setTimeout(() => {
                this.sendIn("Iframe message");
            }, 2000);
        });

    };

    async initWeb3() {
        console.log(window);
        this.web3 = new Web3(Web3.givenProvider || 'ws://localhost:8545');
        const game = new this.web3.eth.Contract(Game.abi, '0x8a351bf2049a1883A3D782e840c621cc17Dbc35f');
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

    // Listen for events emitted from the contract
    listenForEvents() {
        console.log(this.contracts["Game"]);
        console.log(this.contracts["Game"].events);
        this.render();
        // this.contracts["Game"].methods.vote(2).send().then((res) => {
        //     console.log(res);
        // });
    }

    render() {

        // Load account data
        console.log(this.web3.eth.getAccounts()); // пробую здесь получить аккаунт - падает

        this.account = this.web3.eth.defaultAccount;
        console.log(this.account);
        $("#accountAddress").html("Your Account: " + this.account);

        // Load contract data
        // this.contracts["Game"].methods.candidatesCount().call().then((candidatesCount) => {
        //     const candidatesNumber = Number(candidatesCount);
        //     console.log(+candidatesNumber);
        //     var candidatesResults = $("#candidatesResults");
        //     candidatesResults.empty();

        //     var candidatesSelect = $('#candidatesSelect');
        //     candidatesSelect.empty();
        //     console.log(candidatesSelect);
        //     for (var i = 1; i <= candidatesNumber; i++) {
        //         this.contracts["Game"].methods.candidates(i).call().then((candidate) => {
        //             console.log(candidate);
        //             var id = candidate[0];
        //             var name = candidate[1];
        //             var voteCount = candidate[2];

        //             // Render candidate Result
        //             var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
        //             candidatesResults.append(candidateTemplate);

        //             // Render candidate ballot option
        //             var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
        //             candidatesSelect.append(candidateOption);
        //         });
        //     }
        //     console.log(this.account);
        //     return this.contracts["Game"].methods.voters(this.account).call();
        // }).then((hasVoted) => {
        //     this.hasVoted = hasVoted;
        //     console.log(this.hasVoted);
        //     this.cdr.detectChanges();
        //     // Do not allow a user to vote
        //     // if (hasVoted) {
        //     //     $('form').hide();
        //     // }
        //     // loader.hide();
        //     // content.show();
        // }).catch(function (error) {
        //     console.warn(error);
        // });
    }

    login() {
        const playerName = 'Stas';
        this.contracts["Game"].methods.login(playerName).send().catch(function (err) {
            console.error(err);
        });

        this.contracts["Game"].once('loginEvent', {
            filter: {},
            fromBlock: 0
        }, (error, event) => {
            console.log('Logged IN!');
            const message = {
                message: "Login OK",
                value: "document.getElementById('spawn_cell').play();"
            };
            this.sendIn(message);

        })

    }

    sendIn(messageObject) {
        var frame = document.getElementById('game-iframe');
        console.dir(frame);
        frame["contentWindow"].postMessage(messageObject, '*');
    }


}

