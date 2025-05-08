import React from 'react'
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs'
import { TabsContent } from '@radix-ui/react-tabs'
import RelatorioMediuns from './RelatorioMediuns'
import CadastroMedium from './CadastroMedium'

const Mediuns = () => {
  return (
    <>
      <Tabs defaultValue="relatorio" className="m-4">
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value="relatorio" className="cursor-pointer">Relatório</TabsTrigger>
          <TabsTrigger value="cadastro" className="cursor-pointer">Cadastro</TabsTrigger>
        </TabsList>
        <TabsContent value="relatorio">
          <RelatorioMediuns />
        </TabsContent>
        <TabsContent value="cadastro">
          <CadastroMedium />
        </TabsContent>
      </Tabs>
    </>
  )
}

export default Mediuns