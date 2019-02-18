import React from 'react';
import PropTypes from 'prop-types';
import {
  withStyles
} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { ipcRenderer } from 'electron';

const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
});

class BuildOptions extends React.Component {

  web3 = this.props.connection;

  deploySmartContract = () => {
    this.web3.eth.getAccounts((err, accs) => {
      if (err) {
        alert("There was an error fetching your accounts.");
        return;
      }
      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      let accounts = accs;
      let account = accounts[0];
      this.web3.eth.defaultAccount = account;
      let code = this.formCode();
      console.log(code);
      ipcRenderer.send('request-compile', code);
      ipcRenderer.on('request-compile-complete', (event, payload) => {
        let compiledCode = JSON.parse(payload);
        if ('errors' in compiledCode && !('contracts' in compiledCode)) {
          alert(compiledCode['errors'][0]['formattedMessage']);
          return;
        }
        let abiDefinition = compiledCode.contracts['code.sol']['Code'].abi;
        let contract = new this.web3.eth.Contract(abiDefinition);
        let byteCode = compiledCode.contracts['code.sol']['Code'].evm.bytecode.object;
        let deploymentJson = {data: byteCode};
        if (this.props.buildState.constructorParams.length) {
          deploymentJson['arguments'] = this.props.buildState.constructorParams.map(param => param.type === 'int' ? parseInt(param.value) : param.value);
        }
        contract.deploy(deploymentJson)
        .send({
          from: account,
          gas: 1500000,
          gasPrice: '30000000000000'
        })
        .on('error', (error) => { console.log(error) })
        .on('transactionHash', (transactionHash) => { alert(transactionHash) })
        .on('receipt', (receipt) => {
          console.log(receipt.contractAddress) // contains the new contract address
        })
        .on('confirmation', (confirmationNumber, receipt) => { console.log(confirmationNumber) })
        .then((newContractInstance) => {
            console.log(newContractInstance.options.address) // instance with the new contract address
        });
        });
    });
  }

  toLowerCamelCase(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
      return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
    }).replace(/\s+/g, '');
  }

  formCode() {
    let buildState = this.props.buildState;
    let code = 'pragma solidity ^0.5.4;\ncontract Code {\n';
    for (const [name, type] of Object.entries(buildState.variables)) {
      code += `${type} public ${name};\n`;
    }
    for (const [name, params] of Object.entries(buildState.events)) {
      code += `event ${name} (${params.map(param => `${param.type} ${param.name}`).join(', ')});\n`;
    }
    for (let i = 0; i < buildState.tabsCode.length; i++) {
      let functionName = buildState.tabs[i + 1] === 'Initial State' ? 'constructor' : `function ${this.toLowerCamelCase(buildState.tabs[i + 1])}`;
      let returnCode = buildState.tabsReturn[i] ? `returns (${buildState.tabsReturn[i]})` : '';
      let requires = buildState.tabsRequire[i].map(req => {
        if (this.isString(req.var1) && this.isString(req.var2) && req.comp == '==') {
          return `require(keccak256(${req.var1}) == keccak256(${req.var2}), "${req.requireMessage}");\n`;
        }
        return `require(${req.var1} ${req.comp} ${req.var2}, "${req.requireMessage}");\n`
      });
      code += `${functionName}(${buildState.tabsParams[i].map(element => element.type === 'string' ? `${element.type} memory ${element.name}` : `${element.type} ${element.name}`).join(', ')}) public payable ${returnCode} {
      ${requires}${buildState.tabsCode[i]}}\n`;
    }
    return code + '}';
  }

  isString(variable) {
    variable = variable.trim();
    return variable[0] === '\"' && variable[variable.length - 1] === '\"' || variable[0] === "\'" && variable[variable.length - 1] === "\'" ||
    this.props.buildState.variables[variable] === 'string';
  }

  render() {
    const {
      classes,
      theme,
      onback,
      buildState
    } = this.props;
    return ( <
      div >
      <
      Button variant = "outlined"
      color = "primary"
      className = {
        classes.button
      }
      onClick = {
        onback
      } >
      Back <
      /Button>

      <
      Button variant = "contained"
      color = "primary"
      className = {
        classes.button
      }
      onClick = {
        // () => console.log(this.formCode())
        this.deploySmartContract
      } >
      Build <
      /Button> <
      /div>

    );
  }
}

BuildOptions.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  onback: PropTypes.func.isRequired,
  connection: PropTypes.object.isRequired,
  buildState: PropTypes.object.isRequired
};

export default withStyles(styles, {
  withTheme: true
})(BuildOptions);
