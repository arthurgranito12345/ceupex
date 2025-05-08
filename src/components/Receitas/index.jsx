import React from 'react'
import RelatorioReceitas from './RelatorioReceitas'
import CadastroReceitas from './CadastroReceitas'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@/components/ui/tabs'

const Receitas = () => {
  return (
    <Tabs defaultValue="relatorio" className="m-4">
      <TabsList className='grid w-full grid-cols-2'>
        <TabsTrigger value="relatorio" className="cursor-pointer">Relatório</TabsTrigger>
        <TabsTrigger value="cadastro" className="cursor-pointer">Cadastro</TabsTrigger>
      </TabsList>
      <TabsContent value="relatorio">
        <RelatorioReceitas />
      </TabsContent>
      <TabsContent value="cadastro">
        <CadastroReceitas />
      </TabsContent>
    </Tabs>
  )
}

export default Receitas