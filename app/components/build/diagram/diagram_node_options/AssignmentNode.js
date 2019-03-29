import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import DoneIcon from '@material-ui/icons/Done';
import CancelIcon from '@material-ui/icons/Cancel';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import { Typography } from '@material-ui/core';

const styles = theme => ({
  paper: {
    position: 'absolute',
    width: theme.spacing.unit * 50,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 4
  },
  fab: {
    margin: theme.spacing.unit
  },
  rightIcon: {
    display: 'flex',
    'justify-content': 'flex-end'
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 400
  },
  button: {
    margin: theme.spacing.unit
  },
  inline: {
    display: 'flex',
    'justify-content': 'space-evenly',
    'text-align': 'center'
  },
  equals: {
    margin: '5% auto'
  },
  varSelect: {
    margin: theme.spacing.unit,
    minWidth: 150
  },
  textField: {
    marginLeft: 0,
    marginRight: 0
  }
});

class ReturnNode extends React.Component {
  state = {
    variableSelected: '',
    assignedVal: ''
  };

  render() {
    const { classes, close, submit, varList } = this.props;

    return (
      <FormControl className={classes.formControl}>
        <div className={classes.inline}>
          <TextField
            id="standard-name"
            label="Variable Name"
            className={classes.textField}
            value={this.state.variableSelected}
            onChange={event =>
              this.setState({ variableSelected: event.target.value })
            }
            margin="none"
          />
          <Typography className={classes.equals}> &nbsp;=&nbsp; </Typography>
          <TextField
            id="standard-name"
            label="Assigned Value"
            className={classes.textField}
            onChange={event =>
              this.setState({ assignedVal: event.target.value })
            }
            value={this.state.assignedVal}
            margin="none"
          />
        </div>
        <br />

        <div className={classes.rightIcon}>
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={close}
          >
            Cancel
            <CancelIcon />
          </Button>

          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={() => {
              close();
              submit(
                `${this.state.variableSelected} = ${this.state.assignedVal}`
              );
            }}
          >
            Done
            <DoneIcon />
          </Button>
        </div>
      </FormControl>
    );
  }
}

ReturnNode.propTypes = {
  classes: PropTypes.object.isRequired,
  close: PropTypes.func.isRequired,
  submit: PropTypes.func.isRequired,
  varList: PropTypes.object
};

export default withStyles(styles, { withTheme: true })(ReturnNode);
