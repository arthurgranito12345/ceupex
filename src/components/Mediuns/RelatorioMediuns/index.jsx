import React, { useState, useEffect } from 'react';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../../../firebaseConfig';
import { format, fromUnixTime } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function RelatorioMediuns() {
  const [mediunsDebitos, setMediunsDebitos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedium, setSelectedMedium] = useState(null);
  const [contribuicoes, setContribuicoes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMediunsDebitos, setFilteredMediunsDebitos] = useState([]);

  useEffect(() => {
    const fetchDebitosMediums = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'mediuns'));
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          debito_total: doc.data().debito_total,
          nome: doc.data().nome,
        }));
        data.sort((a, b) => a.nome.localeCompare(b.nome));
        setMediunsDebitos(data);
        setFilteredMediunsDebitos(data);
        setLoading(false);
      } catch (err) {
        console.error('Erro ao buscar débitos dos médiuns:', err);
        setError('Erro ao carregar os débitos dos médiuns.');
        setLoading(false);
      }
    };

    fetchDebitosMediums();
  }, []);

  useEffect(() => {
    const fetchContribuicoes = async () => {
      if (selectedMedium?.id) {
        const contribuicoesRef = collection(db, 'mediuns', selectedMedium.id, 'contribuicoes');
        const querySnapshot = await getDocs(contribuicoesRef);
        const contribuicoesData = querySnapshot.docs.map(doc => doc.data());
        setContribuicoes(contribuicoesData);
      } else {
        setContribuicoes([]);
      }
    };

    fetchContribuicoes();
  }, [selectedMedium?.id, isModalOpen]);

  const handleOpenModal = (medium) => {
    setSelectedMedium(medium);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMedium(null);
  };

  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = mediunsDebitos.filter(medium =>
      medium.nome.toLowerCase().includes(term)
    );
    setFilteredMediunsDebitos(filtered);
  };

  const formatDate = (date) => {
    if (!date) return '';

    let jsDate;
    if (date instanceof Date) {
      jsDate = date;
    } else if (date instanceof Timestamp) {
      jsDate = fromUnixTime(date.seconds);
    } else if (typeof date === 'string') {
      jsDate = new Date(date);
      if (isNaN(jsDate.getTime())) return 'Data inválida';
    } else if (typeof date === 'number') {
      jsDate = new Date(date);
      if (isNaN(jsDate.getTime())) return 'Data inválida';
    } else if (date && typeof date.seconds === 'number') {
      jsDate = fromUnixTime(date.seconds);
    } else {
      return 'Data inválida';
    }

    return format(jsDate, 'dd/MM/yyyy', { locale: ptBR });
  };

  if (loading) {
    return <div>Carregando débitos dos médiuns...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Relatório dos Médiuns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-center">
            <div>
              <Label htmlFor="search" className="mb-2">Pesquisar Médium:</Label>
              <Input
                type="text"
                id="search"
                placeholder="Digite o nome do médium..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Médium</TableHead>
                <TableHead className="text-right">Débito Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMediunsDebitos.map(medium => (
                <TableRow key={medium.id} className="w-full cursor-pointer hover:underline" onClick={() => handleOpenModal(medium)}>
                  <TableCell>{medium.nome}</TableCell>
                  <TableCell className="text-right">R${medium.debito_total?.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedMedium?.nome}</DialogTitle>
            <DialogDescription>
              Histórico de contribuições
            </DialogDescription>
          </DialogHeader>
          {selectedMedium && (
            <div className='max-w-full overflow-auto'>
              <Card className="contribuicoes-table w-full min-w-[300]">
                <CardHeader>
                  <CardTitle>Débito Total: R$ {selectedMedium.debito_total?.toFixed(2)}</CardTitle>
                  <CardDescription>Contribuições:</CardDescription>
                </CardHeader>
                <CardContent>
                  {contribuicoes.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Descrição</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contribuicoes.map((contrib, index) => (
                          <TableRow key={index}>
                            <TableCell>{formatDate(contrib.data)}</TableCell>
                            <TableCell className="text-right">R$ {contrib.valor?.toFixed(2)}</TableCell>
                            <TableCell className="capitalize">{contrib.tipo}</TableCell>
                            <TableCell style={{ wordBreak: 'break-word', hyphens: 'auto' }}>{contrib.descricao}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className='text-xs text-center'>Nenhuma contribuição registrada para este médium.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default RelatorioMediuns;