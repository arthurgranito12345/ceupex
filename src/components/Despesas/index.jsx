import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import RelatorioDespesas from './RelatorioDespesas'
import CadastroDespesas from './CadastroDespesas'

const Despesas = () => {
  return (
    <Tabs defaultValue="relatorio" className="m-4">
      <TabsList className='grid w-full grid-cols-2'>
        <TabsTrigger value="relatorio" className="cursor-pointer">Relatório</TabsTrigger>
        <TabsTrigger value="cadastro" className="cursor-pointer">Cadastro</TabsTrigger>
      </TabsList>
      <TabsContent value="relatorio">
        <RelatorioDespesas />
      </TabsContent>
      <TabsContent value="cadastro">
        <CadastroDespesas />
      </TabsContent>
    </Tabs>
  )
}

export default Despesas