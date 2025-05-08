import React, { useState, useEffect } from 'react';
import { db } from '../../../../firebaseConfig';
import { doc, getDoc, addDoc, collection, Timestamp } from 'firebase/firestore';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function CadastroDespesa() {
  const [categorias, setCategorias] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [subcategorias, setSubcategorias] = useState([]);
  const [subcategoriaSelecionada, setSubcategoriaSelecionada] = useState('');
  const [data, setData] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [loadingCategorias, setLoadingCategorias] = useState(true);

  useEffect(() => {
    const fetchCategorias = async () => {
      setLoadingCategorias(true);
      try {
        const categoriasDocRef = doc(db, 'categorias', 'uACDVZ0RaQKMFrTBcSkF');
        const docSnap = await getDoc(categoriasDocRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log('Dados do Firebase:', data);
          setCategorias(data.categorias || []);
          console.log('Categorias no estado:', categorias);
        } else {
          console.log('Nenhum documento encontrado!');
          setCategorias([]);
        }
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        setCategorias([]);
      } finally {
        setLoadingCategorias(false);
      }
    };

    fetchCategorias();
  }, []);

  const handleCategoriaChange = (event) => {
    setCategoriaSelecionada(event);
    const categoriaEncontrada = categorias.find(cat => cat.nome === event);
    console.log('Categoria selecionada:', event);
    console.log('Categoria encontrada:', categoriaEncontrada);
    if (categoriaEncontrada) {
      setSubcategorias(categoriaEncontrada.subcategorias || []);
      console.log('Subcategorias no estado:', subcategorias);
    } else {
      setSubcategorias([]);
    }
    setSubcategoriaSelecionada('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const despesasCollectionRef = collection(db, 'despesas');
      const localDate = new Date(data);
      const offset = localDate.getTimezoneOffset() * 60000; // Offset em milissegundos
      const adjustedDate = new Date(localDate.getTime() + offset);
      const dataTimestamp = Timestamp.fromDate(adjustedDate); // Converta a data ajustada para Timestamp

      await addDoc(despesasCollectionRef, {
        data: dataTimestamp,
        descricao,
        valor: parseFloat(valor),
        categoria: categoriaSelecionada,
        subcategoria: subcategoriaSelecionada,
      });
      setData('');
      setDescricao('');
      setValor('');
      setCategoriaSelecionada('');
      setSubcategoriaSelecionada('');
    } catch (error) {
      console.error('Erro ao cadastrar despesa:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cadastro de Despesa</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="data" className="mb-2">Data</Label>
            <Input
              type="date"
              id="data"
              value={data}
              onChange={(e) => setData(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="descricao" className="mb-2">Descrição</Label>
            <Input
              type="text"
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="valor" className="mb-2">Valor</Label>
            <Input
              type="number"
              id="valor"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="categoria" className="mb-2">Categoria</Label>
            <Select onValueChange={handleCategoriaChange} value={categoriaSelecionada}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={loadingCategorias ? "Carregando..." : "Selecione a Categoria"} />
              </SelectTrigger>
              <SelectContent>
                {loadingCategorias ? null : (
                  categorias.filter((categoria) => categoria.nome !== "Seguros").map((categoria) => (
                    <SelectItem key={categoria.nome} value={categoria.nome}>
                      {categoria.nome}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="subcategoria" className="mb-2">Subcategoria</Label>
            <Select onValueChange={(event) => setSubcategoriaSelecionada(event)} value={subcategoriaSelecionada} disabled={!categoriaSelecionada}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={!categoriaSelecionada ? "Selecione a Categoria" : "Selecione a Subcategoria"} />
              </SelectTrigger>
              <SelectContent>
                {subcategorias.length > 0 ? (
                  subcategorias.map((subcategoria) => (
                    <SelectItem key={subcategoria.nome} value={subcategoria.nome}>
                      {subcategoria.nome}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem disabled value="none">
                    {categoriaSelecionada ? "Nenhuma subcategoria" : "Selecione a Categoria"}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={!categoriaSelecionada || !subcategoriaSelecionada}>
            Cadastrar Despesa
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default CadastroDespesa;