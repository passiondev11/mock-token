const { accounts, contract, privateKeys } = require('@openzeppelin/test-environment');
const { BN, expectRevert, time, expectEvent, constants } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const MUSDT = contract.fromArtifact('MUSDT');

// Token initialSupply of MUSDT Token
const initialSupply = new BN(100000).mul(new BN(10).pow(new BN(18)));

describe('MUSDT', function () {
    const [ownerAddress, userAddress, userAddress1, userAddress2] = accounts;
    const [_, userPrivateKey] = privateKeys;

    // Deploy MUSDT Token
    beforeEach(async function () {
        this.musdt = await MUSDT.new(initialSupply, ownerAddress, {
            from: ownerAddress
        });
    });

    // Check all initial values after MUSDT Token Deployement
    describe('Initalized values', function () {
        it('Token Name', async function () {
            const name = await this.musdt.name();
            expect(name).to.be.equal("Mock USDT");
        });

        it('Token Symbol', async function () {
            const sym = await this.musdt.symbol();
            expect(sym).to.be.equal("MUSDT");
        });

        it('Decimal', async function () {
            const dec = await this.musdt.decimals();
            expect(dec).to.be.bignumber.equal(new BN(18));
        });

        it('Initial Token Supply', async function () {
            const supply = await this.musdt.totalSupply();
            expect(supply).to.be.bignumber.equal(initialSupply);
        });

        it('Minter', async function () {
            const minter = await this.musdt.isMinter(ownerAddress);
            expect(minter).to.be.equal(true);
        });
    });

    // Check all Mint Functionality of MUSDT Token
    describe('Mint', function () {
        it('Mint new tokens from non-minteer', async function () {
            await expectRevert(this.musdt.mint(userAddress, 100, {
                from: userAddress
            }), "MinterRole: caller does not have the Minter role");
        });

        it('Add new minter from non-minter', async function () {
            await expectRevert(this.musdt.addMinter(userAddress, {
                from: userAddress
            }), "MinterRole: caller does not have the Minter role");
        });

        it('Add new minter from minter', async function () {
            await this.musdt.addMinter(userAddress, {
                from: ownerAddress
            });
            const minter = await this.musdt.isMinter(userAddress);
            expect(minter).to.be.equal(true);
        });

        it('Mint new Token', async function () {
            await this.musdt.mint(userAddress, 100, {
                from: ownerAddress
            });

            const supply = await this.musdt.totalSupply();
            expect(supply).to.be.bignumber.equal(new BN(initialSupply).add(new BN(100)));

            const bal = await this.musdt.balanceOf(userAddress);
            expect(bal).to.be.bignumber.equal(new BN(100));
        });
    });

    // Check Transfer Functionality of MUSDT token
    describe('transfer token', function () {
        it('transfer A to B', async function () {
            await this.musdt.transfer(userAddress, 1000, {
                from: ownerAddress
            });

            const bal = await this.musdt.balanceOf(userAddress);
            expect(bal).to.be.bignumber.equal(new BN(1000));
        });

        it('Cross balance cap', async function () {
            await expectRevert(this.musdt.transfer(userAddress, 10001, {
                from: userAddress1
            }), "ERC20: transfer amount exceeds balance");
        });
    });

    // Check TransferFrom Functionality of MUSDT token
    describe('transferFrom token', function () {
        it('transferFrom A to B without approve', async function () {
            await expectRevert(this.musdt.transferFrom(ownerAddress, userAddress, 1000, {
                from: userAddress
            }), "ERC20: transfer amount exceeds allowance");
        });

        it('transferFrom A to B with approve', async function () {
            await this.musdt.approve(userAddress, 10000, {
                from: ownerAddress
            });
            await this.musdt.transferFrom(ownerAddress, userAddress, 10000, {
                from: userAddress
            });

            const bal = await this.musdt.balanceOf(userAddress);
            expect(bal).to.be.bignumber.equal(new BN(10000));
        });

        it('transferFrom A to B with approve with large balance', async function () {
            await this.musdt.approve(userAddress, 10000, {
                from: userAddress
            });
            await expectRevert(this.musdt.transferFrom(ownerAddress, userAddress, 100000, {
                from: userAddress
            }), "ERC20: transfer amount exceeds allowance");
        });
    });

    // Check Approve Functionality of MUSDT token
    describe('Approve', function () {
        it('Initial Allowance value', async function () {
            expect(await this.musdt.allowance(ownerAddress, userAddress)).to.be.bignumber.equal(new BN(0));
        });

        it('increase allowance', async function () {
            await this.musdt.approve(userAddress, 10000, {
                from: ownerAddress
            });
            expect(await this.musdt.allowance(ownerAddress, userAddress)).to.be.bignumber.equal(new BN(10000));
        });
    });

    // Check Burn Functionality of MUSDT token
    describe('Burn', function () {
        it('Burn', async function () {
            await this.musdt.burn(100, {
                from: ownerAddress
            });

            const bal = await this.musdt.balanceOf(ownerAddress);
            expect(new BN(bal)).to.be.bignumber.equal(new BN(initialSupply).sub(new BN(100)));

            const supply = await this.musdt.totalSupply();
            expect(new BN(bal)).to.be.bignumber.equal(new BN(initialSupply).sub(new BN(100)));
        });

        it('burn amount exceeds balance', async function () {
            await expectRevert(this.musdt.burn(100000, {
                from: userAddress
            }), "ERC20: burn amount exceeds balance");
        });
    });

    // Check Burn From Functionality of MUSDT token
    describe('Burn From', function () {
        it('burn A to B without approve', async function () {
            await expectRevert(this.musdt.burnFrom(ownerAddress, 1000, {
                from: userAddress
            }), "ERC20: burn amount exceeds allowance");
        });

        it('burnFrom A to B with approve', async function () {
            await this.musdt.approve(userAddress, 10000, {
                from: ownerAddress
            });
            await this.musdt.burnFrom(ownerAddress, 10000, {
                from: userAddress
            });

            const bal = await this.musdt.balanceOf(ownerAddress);
            expect(new BN(bal)).to.be.bignumber.equal(new BN(initialSupply).sub(new BN(10000)));
        });
    });
});