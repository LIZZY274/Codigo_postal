import bcrypt from 'bcryptjs';
import { readExcel } from '../utils/excelReader';
import {db} from '../database/mysql';


interface User {
  id: number;
  username: string;
  password: string;
}

const dataFalse = [
  {
    d_codigo: '29014',
    d_asenta: 'Rosario Poniente',
    d_tipo_asenta: 'Colonia',
    D_mnpio: 'Tuxtla Gutiérrez',
    d_estado: 'Chiapas',
    d_ciudad: 'Tuxtla Gutiérrez',
    d_CP: '29002',
    c_estado: '07',
    c_oficina: '29002',
    c_tipo_asenta: '09',
    c_mnpio: '101',
    id_asenta_cpcons: '2854',
    d_zona: 'Urbano',
    c_cve_ciudad: '04'
  },
  {
    d_codigo: '29014',
    d_asenta: 'México',
    d_tipo_asenta: 'Colonia',
    D_mnpio: 'Tuxtla Gutiérrez',
    d_estado: 'Chiapas',
    d_ciudad: 'Tuxtla Gutiérrez',
    d_CP: '29002',
    c_estado: '07',
    c_oficina: '29002',
    c_tipo_asenta: '09',
    c_mnpio: '101',
    id_asenta_cpcons: '3239',
    d_zona: 'Urbano',
    c_cve_ciudad: '04'
  },
]

interface AsentamientoData {
  d_codigo: string;
  d_asenta: string;
  d_tipo_asenta?: string;
  D_mnpio?: string;
  d_ciudad?: string;
  d_CP: string;
  c_estado: string
  c_oficina: string
  c_tipo_asenta: string
  c_mnpio: string
  id_asenta_cpcons: string
  d_zona: string
  c_cve_ciudad: string
}

const excelData: AsentamientoData[] = readExcel('../sepomex-api/src/data/codigos_postales.xlsx') as AsentamientoData[];

export const resolvers = {
  Query: {
    login: async (_: any, { username, password }: { username: string, password: string }) => {
      const [rows]: any = await db.query('SELECT * FROM users WHERE username = ?', [username]);
      const user: User = rows[0];
      if (user && bcrypt.compareSync(password, user.password)) {

        return { id: user.id, username: user.username };
      }
      throw new Error('Invalid credentials');
    },
    getAsentamientosByCP: async (_: any, { codigoPostal }: { codigoPostal: string }) => { 
      const query = "select * from codigospostal where d_codigo=? ";  
      const result = await db.query(query,[parseInt(codigoPostal)])
      
      return result[0]
    },
    getCodigoPostalByAsentamiento: async (_: any, { asentamiento }: { asentamiento: string }) => {
      const entry = excelData.find((entry) => entry.d_asenta === asentamiento);
      const query = "select d_codigo from codigospostal where d_asenta=?";
      const result = await db.query(query,[asentamiento])
      
      console.log (result[0].toString())
      return result
    },
    getDetailsByAsentamiento: async (_: any, { asentamiento }: { asentamiento: string }) => {
      const query = "select * from codigospostal where d_asenta=?";
      const result = await db.query(query,[asentamiento])
      return result
    }
  },
  Mutation: {
    register: async (_: any, { username, password }: { username: string, password: string }) => {
      const hashedPassword = bcrypt.hashSync(password, 10);
      await db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
    }
  }
};
