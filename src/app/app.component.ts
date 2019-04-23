import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import Web3 from 'web3';
import * as $ from 'jquery';
import Election from '../../build/contracts/Election.json';
import { TweenMax, Power2, TimelineLite } from "gsap/TweenMax";

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

        Object.getOwnPropertyNames(Math).map(function (p) {
            window[p] = Math[p];
        });

        Number.prototype.ξ = function (b, a, flag) {

            var b = ((b - 1) || 0) + 1,
                a = a || 0,
                c1 = (flag && flag % 2 === 0)
                    ? (this >= a)
                    : (this > a),
                c2 = (flag && flag % 3 === 0)
                    ? (this <= b)
                    : (this < b);

            return c1 && c2;
        };

        var rand = function (max, min, is_int) {
            var max = ((max - 1) || 0) + 1,
                min = min || 0,
                gen = min + (max - min) * Math.random();

            return (is_int) ? Math.round(gen) : gen;
        };

        var svg = document.querySelector('svg'),
            stars = svg.querySelectorAll('use'),
            n = stars.length,
            d = .4 * svg.getAttribute('viewBox')
                .split(' ')[2],
            α = 360 / n,
            β = rand(α, 0, 1),
            θ = 90, f = .2,
            t_unit = 120, t = 3 * t_unit,
            r_id = null,
            running = false;

        var ani = function () {


            var rt, γ, t_val;

            rt = t;
            for (var i = 0; i < n; i++) {
                γ = (i * α + β) * rt / t_unit;
                t_val = 'rotate(' + γ + ')';;
                stars[i].setAttribute('transform', t_val);
                stars[i].style.fill =
                    'hsl(' + γ + ',100%, 80%)';
            }
            //      }

            // if (t.ξ(2 * t_unit, t_unit, 2)) {
            //     rt = t - t_unit;
            //     cd = d * rt / t_unit;
            //     cf = 1 + (f - 1) * rt / t_unit;

            //     for (var i = 0; i < n; i++) {
            //         γ = (i * α + β);
            //         t_val = 'rotate(' + γ + ')';

            //         // 'translate(' + cd + ') ' +
            //         // 'scale(' + 0.3 + ')';
            //         stars[i].setAttribute('transform', t_val);
            //     }
            // }

            // if (t.ξ(3 * t_unit, 2 * t_unit, 2)) {
            //     //     rt = t - 2 * t_unit;
            //     //     φ = θ * rt / t_unit;
            //     //     cc = cos(φ * PI / 180);

            //     for (var i = 0; i < n; i++) {
            //         γ = (i * α + β);

            //         t_val = 'rotate(' + γ + ')';
            //         //             'translate(' + d + ') ' +
            //         //             'skewY(' + φ + ') ' +
            //         //             //  'scale(' + cc * f + ' ' + f + ') ';
            //         stars[i].setAttribute('transform', t_val);
            //         //     }
            //         // }
            //     }
            // }

            // if (t.ξ(4 * t_unit, 3 * t_unit, 2)) {
            //     rt = t - 3 * t_unit;
            //     cf = rt / t_unit;
            //     γ = (i * α + β);
            //     t_val = 'rotate(' + γ + ') ';

            //     for (var i = 0; i < n; i++) {

            //         stars[i].setAttribute('transform', t_val);

            //         γ = (i * α + β) * rt / t_unit;
            //         stars[i].style.fill =
            //             'hsl(' + γ + ',100%, 80%)';
            //     }
            // }

            if (t === 4 * t_unit) {
                t = 0;
                β = rand(α, 0, 1)
            }

            t++;

            if (running) {
                r_id = requestAnimationFrame(ani);
            }
        };

        ani();

        addEventListener('click', (event) => {

            running = !running;

            if (running) ani();
            else {
                cancelAnimtionFrame(r_id);
                r_id = null;
            }
        }, false);

        // var svg = document.querySelector('svg'),
        //     stars = svg.querySelectorAll('use'),
        //     n = stars.length;

        // const $wrapper = $('#battlefield');
        // let $circle;

        // function moveCircle(e) {
        //     for (var i = 0; i < n; i++) {
        //         $circle = stars[i];
        //         TweenMax.to($circle, 0.8, {
        //             css: {
        //                 left: e.clientX,
        //                 top: e.clientY
        //             }
        //         });
        //         flag = true;
        //     }
        // }

        // var flag = false;
        // $($wrapper).mouseover(function () {

        //     TweenMax.to($circle, 0.4, { scale: 1, autoAlpha: 1 })
        //     $($wrapper).on('mousemove', moveCircle.bind(this));

        // });
        // $($wrapper).mouseout(function () {
        //     for (var i = 0; i < n; i++) {
        //         flag = false;
        //         $circle = stars[i];
        //         TweenMax.to($circle, 0.4, { scale: 0.1, autoAlpha: 0 })
        //     }
        // });


        const result = this.initWeb3();
        result.then((response) => {
            console.log(response);
            this.contracts = response.contracts;
            this.listenForEvents();
        });

    };

    async initWeb3() {
        console.log(window);
        this.web3 = new Web3(Web3.givenProvider || 'ws://localhost:8545');
        const election = new this.web3.eth.Contract(Election.abi, '0x8a351bf2049a1883A3D782e840c621cc17Dbc35f');
        const accounts = await window['ethereum'].enable();

        this.web3.eth.defaultAccount = accounts[0];
        const result = {
            contracts:
            {
                Election: election
            },
            web3: this.web3
        };
        return result;
    }

    // Listen for events emitted from the contract
    listenForEvents() {
        console.log(this.contracts["Election"]);
        console.log(this.contracts["Election"].events);
        this.render();
        // this.contracts["Election"].methods.vote(2).send().then((res) => {
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
        this.contracts["Election"].methods.candidatesCount().call().then((candidatesCount) => {
            const candidatesNumber = Number(candidatesCount);
            console.log(+candidatesNumber);
            var candidatesResults = $("#candidatesResults");
            candidatesResults.empty();

            var candidatesSelect = $('#candidatesSelect');
            candidatesSelect.empty();
            console.log(candidatesSelect);
            for (var i = 1; i <= candidatesNumber; i++) {
                this.contracts["Election"].methods.candidates(i).call().then((candidate) => {
                    console.log(candidate);
                    var id = candidate[0];
                    var name = candidate[1];
                    var voteCount = candidate[2];

                    // Render candidate Result
                    var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
                    candidatesResults.append(candidateTemplate);

                    // Render candidate ballot option
                    var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
                    candidatesSelect.append(candidateOption);
                });
            }
            console.log(this.account);
            return this.contracts["Election"].methods.voters(this.account).call();
        }).then((hasVoted) => {
            this.hasVoted = hasVoted;
            console.log(this.hasVoted);
            this.cdr.detectChanges();
            // Do not allow a user to vote
            // if (hasVoted) {
            //     $('form').hide();
            // }
            // loader.hide();
            // content.show();
        }).catch(function (error) {
            console.warn(error);
        });
    }

    castVote() {
        var candidateId = $('#candidatesSelect').val();
        this.contracts["Election"].methods.vote(candidateId).send({ from: this.account }).catch(function (err) {
            console.error(err);
        });

        this.contracts["Election"].once('votedEvent', {
            filter: {},
            fromBlock: 0
        }, (error, event) => {
            console.log(event);
            console.log('Voted!');
            this.render();
        })

    }


}

