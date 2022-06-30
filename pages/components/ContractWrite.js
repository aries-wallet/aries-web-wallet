import { JsonForms } from "@jsonforms/react";
import { materialCells, materialRenderers } from "@jsonforms/material-renderers";

import { Button, Paper, Stack } from "@mui/material";
import { Collapse } from "antd";
import { useMemo, useState } from "react";
import { objectToArray } from "./ContractRead";

const { Panel } = Collapse;

function WritePanel(props) {
  const subAbi = props.subAbi;
  const send = props.send;
  const [inputData, setInputData] = useState({});

  return <div>
    <Stack spacing={1}>
      { subAbi.inputs && <JsonForms 
          renderers={materialRenderers}
          cells={materialCells}
          data={inputData}
          onChange={e=>setInputData(e.data)}
          schema={abiToSchema(subAbi.inputs, subAbi.stateMutability === 'payable')}
          uischema={abiToUISchema(subAbi.inputs, subAbi.stateMutability === 'payable')}
        />
      }
      <Button style={{width: '120px'}} variant="outlined" size="small" onClick={async ()=>{
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
      }} >Write</Button>
    </Stack>
  </div>
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
  console.log('props', props);
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