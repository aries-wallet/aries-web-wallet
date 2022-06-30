import { Paper } from "@mui/material";
import { Contract } from "./components/contract";

export default function SmartContract(props) {
  return <Paper sx={{minHeight: '100vh', padding: '30px', overflow:'auto'}}>
    <Contract />
  </Paper>
}

