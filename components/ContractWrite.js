import { useState, useMemo } from "react";
import { objectToArray } from "./ContractRead";
import styles from './ContractWrite.module.css';
import { Paper } from "@mui/material";
import { Collapse } from 'antd';

const { Panel } = Collapse;

function WritePanel(props) {
  const { subAbi, send } = props;
  const [inputData, setInputData] = useState({});

  const handleInputChange = (e) => {
    setInputData({ ...inputData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('inputData', inputData);
    if (objectToArray(inputData, subAbi.inputs, subAbi.stateMutability === 'payable').length < subAbi.inputs.length) {
      console.log("input params count error");
      return;
    }
    let params = {...inputData};
    let payable = params.payable;
    if (payable) {
      delete params.payable;
    }

    await send(subAbi, objectToArray(params, subAbi.inputs), payable);
  };

  return (
    <div className={styles.writePanel}>
      <form onSubmit={handleSubmit}>
        {subAbi.inputs && subAbi.inputs.map((input, index) => (
          <div key={index} className={styles.inputGroup}>
            <label htmlFor={input.name || `param${index}`}>
              {input.name || `param${index}`}
              <span className={styles.inputType}>{input.type}</span>
            </label>
            <input
              type="text"
              id={input.name || `param${index}`}
              name={input.name || `param${index}`}
              onChange={handleInputChange}
              className={styles.input}
            />
          </div>
        ))}
        {subAbi.stateMutability === 'payable' && (
          <div className={styles.inputGroup}>
            <label htmlFor="payable">
              payable value
              <span className={styles.inputType}>uint256</span>
            </label>
            <input
              type="text"
              id="payable"
              name="payable"
              onChange={handleInputChange}
              className={styles.input}
            />
          </div>
        )}
        <button type="submit" className={styles.writeButton}>Write</button>
      </form>
    </div>
  );
}

export function ContractWrite(props) {
  const send = props.send;
  const abi = useMemo(()=>{
    return props.abi.filter(v=>!(v.type !== 'function' || v.stateMutability === 'view'));
  }, [props.abi]);

  return <Paper style={{width: '100%', marginTop: "10px", padding: "10px", borderRadius: '10px'}} elevation={0} >
    <Collapse defaultActiveKey={['1']}>
      {
        abi.map((v, i)=>{
          return <Panel header={`${i+1}. ${v.name}`} key={`${i+1}`}>
            <WritePanel subAbi={v} send={send} />
          </Panel>
        })
      }
    </Collapse>
  </Paper>
}

function abiToSchema(subAbi, payable) {
  let props = {};
  subAbi.map((v,i)=>{
    props[v.name ? v.name : `param${i}`] = {
      type: 'string',
      title: v.name ? v.name : `param${i}`,
      description: v.type,
    };
    return props;
  })
  if (payable) {
    props['payable'] = {
      type: 'string',
      title: 'payable value',
      description: 'uint256',
    }
  }
  return {
    type: 'object',
    properties: props,
  }
}

function abiToUISchema(subAbi, payable) {
  let elements = subAbi.map((v,i)=>{
    return {
      type: 'Control',
      scope: '#/properties/' + (v.name ? v.name : `param${i}`),
      options: {
        showUnfocusedDescription: true
      }
    };
  })

  if (payable) {
    elements.push({
      type: 'Control',
      scope: '#/properties/payable',
      options: {
        showUnfocusedDescription: true
      }
    })
  }

  return {
    type: 'VerticalLayout',
    elements,
  }
}