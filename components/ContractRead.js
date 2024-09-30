import { Button, Paper, Stack } from "@mui/material";
import { Collapse } from "antd";
import { useEffect, useMemo, useState } from "react";
import { ethers } from 'ethers';
import styles from './ContractRead.module.css';

const { Panel } = Collapse;

const convertFromWei = (value, unit) => {
  if (!value) return '';
  switch(unit) {
    case 'Wei':
      return value.toString();
    case 'Gwei':
      return ethers.utils.formatUnits(value, 9);
    case 'Ether':
      return ethers.utils.formatUnits(value, 18);
    default:
      return value.toString();
  }
};

function ReadPanel(props) {
  const { subAbi, sc } = props;
  const [inputData, setInputData] = useState({});
  const [outputData, setOutputData] = useState([]);
  const [inputUnits, setInputUnits] = useState({});
  const [outputUnits, setOutputUnits] = useState({});
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let params = objectToArray(inputData, subAbi.inputs);
        if (subAbi.inputs.length === 0 || params.length > 0) {
          console.log(`query sc function ${subAbi.name} with params ${params} pending...`);
          const result = await sc.methods[subAbi.name](...params).call();
          console.log(`query sc function ${subAbi.name} return`, result);
          setOutputData(result);
        }
      } catch (err) {
        console.error('ERROR:', err.message);
      }
    };

    fetchData();
  }, [reload, subAbi, inputData, sc]);

  const handleInputChange = (e) => {
    setInputData({ ...inputData, [e.target.name]: e.target.value });
  };

  const handleUnitChange = (e, name) => {
    setInputUnits({ ...inputUnits, [name]: e.target.value });
  };

  const handleOutputUnitChange = (e, name) => {
    setOutputUnits({ ...outputUnits, [name]: e.target.value });
  };

  return (
    <div className={styles.readPanel}>
      <Stack spacing={1}>
        {subAbi.inputs && subAbi.inputs.length > 0 && (
          <form>
            {subAbi.inputs.map((input, index) => (
              <div key={index} className={styles.inputGroup}>
                <label htmlFor={input.name || `param${index}`}>
                  {input.name || `param${index}`}
                  <span className={styles.inputType}>{input.type}</span>
                </label>
                <div className={styles.inputWrapper}>
                  {input.type === 'uint256' && (
                    <select
                      name={input.name || `param${index}`}
                      value={inputUnits[input.name || `param${index}`] || 'Wei'}
                      onChange={(e) => handleUnitChange(e, input.name || `param${index}`)}
                      className={styles.unitSelect}
                    >
                      <option value="Wei">Wei</option>
                      <option value="Gwei">Gwei</option>
                      <option value="Ether">Ether</option>
                    </select>
                  )}
                  <input
                    type="text"
                    id={input.name || `param${index}`}
                    name={input.name || `param${index}`}
                    onChange={handleInputChange}
                    className={styles.input}
                  />
                </div>
              </div>
            ))}
          </form>
        )}
        <Button style={{width: '120px'}} variant="outlined" size="small" onClick={() => setReload(Date.now())}>
          Query
        </Button>
        {subAbi.outputs.length === 1 && (
          <div className={styles.outputGroup}>
            <div className={styles.outputWrapper}>
              {subAbi.outputs[0].type === 'uint256' && (
                <select
                  value={outputUnits[subAbi.outputs[0].name] || 'Wei'}
                  onChange={(e) => handleOutputUnitChange(e, subAbi.outputs[0].name)}
                  className={styles.unitSelect}
                >
                  <option value="Wei">Wei</option>
                  <option value="Gwei">Gwei</option>
                  <option value="Ether">Ether</option>
                </select>
              )}
              <span className={styles.outputValue}>
                {convertFromWei(outputData, outputUnits[subAbi.outputs[0].name] || 'Wei')}
              </span>
            </div>
            <span className={styles.outputType}>{subAbi.outputs[0].type}</span>
          </div>
        )}
        {subAbi.outputs.length > 1 && subAbi.outputs.map((output, i) => (
          <div key={i} className={styles.outputGroup}>
            <span className={styles.outputLabel}>{output.name}:</span>
            <div className={styles.outputWrapper}>
              {output.type === 'uint256' && (
                <select
                  value={outputUnits[output.name] || 'Wei'}
                  onChange={(e) => handleOutputUnitChange(e, output.name)}
                  className={styles.unitSelect}
                >
                  <option value="Wei">Wei</option>
                  <option value="Gwei">Gwei</option>
                  <option value="Ether">Ether</option>
                </select>
              )}
              <span className={styles.outputValue}>
                {convertFromWei(outputData[i], outputUnits[output.name] || 'Wei')}
              </span>
            </div>
            <span className={styles.outputType}>{output.type}</span>
          </div>
        ))}
      </Stack>
    </div>
  );
}

export function ContractRead(props) {
  const web3 = props.web3;
  const scAddr = props.scAddr;
  const abi = useMemo(() => {
    return props.abi.filter(v => 
      v.type === 'function' && (v.stateMutability === 'view' || v.stateMutability === 'pure')
    );
  }, [props.abi]);
  
  const sc = useMemo(()=>{
    console.log('scAddr 2', scAddr);
    try {
      return new web3.eth.Contract(abi, scAddr);
    } catch (err) {
      console.error('ERROR', err);
    }
  }, [web3, scAddr, abi]);

  return <Paper style={{width: '100%', marginTop: "10px", padding: "10px", borderRadius: '10px'}} elevation={0} >
    <Collapse defaultActiveKey={['1']}>
      {
        abi.map((v, i)=>{
          return <Panel header={`${i+1}. ${v.name}`} key={`${i+1}`}>
            <ReadPanel subAbi={v} sc={sc} />
          </Panel>
        })
      }
    </Collapse>
  </Paper>
}

function abiToSchema(subAbi) {
  let props = {};
  subAbi.map((v,i)=>{
    props[v.name ? v.name : `param${i}`] = {
      type: 'string',
      title: v.name ? v.name : `param${i}`,
      description: v.type,
    };
    return props;
  })
  return {
    type: 'object',
    properties: props,
  }
}

function abiToUISchema(subAbi) {
  let elements = subAbi.map((v,i)=>{
    return {
      type: 'Control',
      scope: '#/properties/' + (v.name ? v.name : `param${i}`),
      options: {
        showUnfocusedDescription: true
      }
    };
  })

  return {
    type: 'VerticalLayout',
    elements,
  }
}

export function objectToArray(object, abi, payable) {
  console.log('object', object);
  let ret = [];
  abi.map((v,i)=>{
    let obj = object[v.name ? v.name : `param${i}`];
    try {
      if (obj.toString().includes('[') || obj.toString().includes('{')) {
        obj = JSON.parse(obj);
      }
    } catch {

    }
    if (typeof obj === 'number') {
      ret.push(obj.toString());
    } else {
      ret.push(obj);
    }
    return ret;
  })
  if (payable) {
    ret.push(object['payable']);
  }
  ret = ret.map(v=>{
    if (v === 'true') {
      return true;
    }
    if (v === 'false') {
      return false;
    }
    return v;
  })
  console.log('ret', ret);
  return ret;
}