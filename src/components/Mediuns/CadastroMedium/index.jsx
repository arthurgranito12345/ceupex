import React, { useState, useEffect } from 'react';
import { collection, addDoc, doc, getDocs, updateDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../../../firebaseConfig';

// Importe os componentes do Shadcn UI
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Cadastro from '@/components/CadastroNovoMedium';

function AdicionarContribuicao() {
  const [selectedMediumId, setSelectedMediumId] = useState('');
  const [mediuns, setMediuns] = useState([]);
  const [filteredMediuns, setFilteredMediuns] = useState([]); // Novo estado para médiuns filtrados
  const [searchTermMedium, setSearchTermMedium] = useState(''); // Novo estado para o termo de pesquisa
  const [receitaCategorias, setReceitaCategorias] = useState([]);
  const [data, setData] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState('');
  const [selectedReceitaCategoria, setSelectedReceitaCategoria] = useState('');
  const [adicionando, setAdicionando] = useState(false);

  useEffect(() => {
    const fetchMediuns = async () => {
      const querySnapshot = await getDocs(collection(db, 'mediuns'));
      const mediunsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMediuns(mediunsList);
      setFilteredMediuns(mediunsList); // Inicializa a lista filtrada com todos os médiuns
    };

    const fetchReceitaCategorias = async () => {
      // Referência ao documento de categorias de receita
      const receitasDocRef = doc(db, 'categorias', 'NUHFBehq9RrPSXBOtCQf');
      // Referência à subcoleção de receitas dentro desse documento
      const receitasCategoriasCollection = collection(receitasDocRef, 'receitas');

      try {
        const querySnapshot = await getDocs(receitasCategoriasCollection);
        const categoriasList = querySnapshot.docs.map(doc => ({ id: doc.id, nome: doc.data().nome }));
        setReceitaCategorias(categoriasList);
      } catch (error) {
        console.error('Erro ao buscar categorias de receita:', error);
      }
    };

    fetchMediuns();
    fetchReceitaCategorias();
  }, []);

  const handleSearchMedium = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTermMedium(term);
    const filtered = mediuns.filter(medium =>
      medium.nome.toLowerCase().includes(term)
    );
    setFilteredMediuns(filtered);
    // Limpa a seleção anterior quando o termo de pesquisa muda
    setSelectedMediumId('');
    setAdicionando(false);
  };

  const handleMediumChange = (value) => {
    setSelectedMediumId(value);
    setAdicionando(true);
  };

  const handleReceitaCategoriaChange = (value) => {
    setSelectedReceitaCategoria(value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedMediumId) {
      alert('Selecione um médium.');
      return;
    }

    try {
      // Converter a string de data para um objeto Date
      const [ano, mes, dia] = data.split('-').map(Number);
      const dataObj = new Date(ano, mes - 1, dia);
      // Converter o objeto Date para um Timestamp do Firebase
      const dataTimestamp = Timestamp.fromDate(dataObj);

      const contribuicoesRef = collection(db, 'mediuns', selectedMediumId, 'contribuicoes');
      await addDoc(contribuicoesRef, {
        data: dataTimestamp, // Salvar como Timestamp
        valor: parseFloat(valor),
        tipo: tipo,
        descricao: selectedReceitaCategoria, // Usando a categoria como descrição da contribuição
        data: dataTimestamp,
      });
      console.log('Contribuição adicionada ao médium com ID: ', selectedMediumId, 'Categoria:', selectedReceitaCategoria, 'Data:', dataTimestamp);

      const mediumRef = doc(db, 'mediuns', selectedMediumId);
      const mediumSnap = await getDoc(mediumRef);
      const mediumData = mediumSnap.data();
      const mediumNome = mediumData?.nome || ''; // Obtém o nome do médium

      if (mediumSnap.exists()) {
        const currentDebitoTotal = mediumSnap.data().debito_total || 0;
        let novoDebitoTotal = currentDebitoTotal;

        if (tipo === 'debito') {
          novoDebitoTotal += parseFloat(valor);
        } else if (tipo === 'pagamento') {
          novoDebitoTotal -= parseFloat(valor);
          if (novoDebitoTotal < 0) {
            novoDebitoTotal = 0;
          }

          // Criar um registro de receita na subcoleção 'receitas'
          const receitasDocRef = doc(db, 'receitas', 'Y2zlodrLAkak0sCTrso9');
          const receitasCollectionRef = collection(receitasDocRef, 'receitas');
          await addDoc(receitasCollectionRef, {
            categoria: selectedReceitaCategoria,
            data: dataTimestamp, // Salvar como Timestamp
            descricao: mediumNome, // Usando o nome do médium como descrição da receita
            referencia: selectedReceitaCategoria,
            valor: parseFloat(valor),
          });
          console.log('Registro de receita criado:', selectedReceitaCategoria, dataTimestamp, mediumNome, selectedReceitaCategoria, parseFloat(valor));
        }

        await updateDoc(mediumRef, {
          debito_total: novoDebitoTotal,
        });
        console.log('Débito total do médium atualizado para:', novoDebitoTotal);
      } else {
        console.log('Documento do médium não encontrado.');
      }

      setData('');
      setValor('');
      setTipo('pagamento');
      setSelectedReceitaCategoria('');
      setAdicionando(false);
      setSelectedMediumId('');
      setSearchTermMedium(''); // Limpa o termo de pesquisa após o envio
    } catch (error) {
      console.error('Erro ao adicionar contribuição ou receita:', error);
      alert('Erro ao adicionar contribuição ou receita.');
    }
  };

  return (
    <>
      <Card className="mb-5">
        <CardHeader>
          <CardTitle>Adicionar Contribuição</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div>
            <Label htmlFor="medium-search" className="mb-2">Pesquisar Médium:</Label>
            <Input
              type="text"
              id="medium-search"
              placeholder="Digite o nome do médium..."
              value={searchTermMedium}
              onChange={handleSearchMedium}
            />
          </div>

          <div>
            <Label htmlFor="medium" className="mb-2">Selecione o Médium:</Label>
            <Select onValueChange={handleMediumChange} value={selectedMediumId} disabled={searchTermMedium.length > 0 && filteredMediuns.length === 0}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={searchTermMedium.length > 0 && filteredMediuns.length === 0 ? "Nenhum médium encontrado" : "Selecione..."} />
              </SelectTrigger>
              <SelectContent>
                {filteredMediuns.map(medium => (
                  <SelectItem key={medium.id} value={medium.id}>{medium.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {adicionando && (
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <Label htmlFor="data" className="mb-2">Data:</Label>
                <Input type="date" id="data" value={data} onChange={(e) => setData(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="valor" className="mb-2">Valor:</Label>
                <Input type="number" id="valor" value={valor} onChange={(e) => setValor(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="tipo" className="mb-2">Tipo:</Label>
                <Select onValueChange={(value) => setTipo(value)} value={tipo}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pagamento">Pagamento</SelectItem>
                    <SelectItem value="debito">Débito</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="receitaCategoria" className="mb-2">Descrição (Categoria de Receita):</Label>
                <Select onValueChange={handleReceitaCategoriaChange} value={selectedReceitaCategoria}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {receitaCategorias.map(categoria => (
                      <SelectItem key={categoria.id} value={categoria.nome}>
                        {categoria.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit">Adicionar Contribuição</Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Cadastro />
    </>
  );
}

export default AdicionarContribuicao;