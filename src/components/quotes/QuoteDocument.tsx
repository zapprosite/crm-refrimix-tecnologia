import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

// Registrar fonte padrão (opcional, usando Helvetica por padrão que já vem embutida)
// Font.register({ family: 'Roboto', src: '...' });

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 10,
  },
  logoContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  companyInfo: {
    textAlign: 'right',
    flexDirection: 'column',
    gap: 2,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563EB', // Blue-600
    textTransform: 'uppercase',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  metaData: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  clientContainer: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 4,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#64748B',
    textTransform: 'uppercase',
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '15%',
    borderStyle: 'solid',
    borderColor: '#E2E8F0',
    borderBottomColor: '#000',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#F1F5F9',
    padding: 5,
  },
  tableColDescHeader: {
    width: '55%',
    borderStyle: 'solid',
    borderColor: '#E2E8F0',
    borderBottomColor: '#000',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#F1F5F9',
    padding: 5,
  },
  tableCol: {
    width: '15%',
    borderStyle: 'solid',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableColDesc: {
    width: '55%',
    borderStyle: 'solid',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableCellHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableCell: {
    fontSize: 9,
    textAlign: 'center',
  },
  tableCellDesc: {
    fontSize: 9,
    textAlign: 'left',
  },
  totalsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  totalBox: {
    width: '40%',
    padding: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  grandTotal: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2563EB',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 5,
    marginTop: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
  },
  notes: {
    marginTop: 30,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 4,
    minHeight: 50,
  },
});

interface QuoteItem {
  description: string;
  quantity: number;
  price: number;
}

export interface QuoteData {
  companyName: string;
  companyAddress: string;
  companyEmail: string;
  companyPhone: string;
  logo?: string | null;
  
  clientName: string;
  clientAddress: string;
  clientEmail: string;
  
  quoteNumber: string;
  date: string;
  dueDate: string;
  
  items: QuoteItem[];
  notes?: string;
}

export const QuoteDocument = ({ data }: { data: QuoteData }) => {
  const total = data.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            {data.logo ? (
              <Image style={styles.logo} src={data.logo} />
            ) : (
              <Text style={{color: '#CBD5E1'}}>Logo</Text>
            )}
          </View>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{data.companyName || 'Sua Empresa'}</Text>
            <Text>{data.companyAddress}</Text>
            <Text>{data.companyEmail}</Text>
            <Text>{data.companyPhone}</Text>
          </View>
        </View>

        {/* Title & Meta */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>ORÇAMENTO</Text>
          <View style={styles.metaData}>
            <Text>Número: #{data.quoteNumber}</Text>
            <Text>Data: {data.date ? new Date(data.date).toLocaleDateString('pt-BR') : ''}</Text>
            <Text>Validade: {data.dueDate ? new Date(data.dueDate).toLocaleDateString('pt-BR') : ''}</Text>
          </View>
        </View>

        {/* Client Info */}
        <View style={styles.clientContainer}>
          <Text style={styles.sectionTitle}>Cliente</Text>
          <Text style={{fontWeight: 'bold', fontSize: 11}}>{data.clientName}</Text>
          <Text>{data.clientAddress}</Text>
          <Text>{data.clientEmail}</Text>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableColDescHeader}>
              <Text style={styles.tableCellHeader}>Descrição</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Qtd</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Unitário</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Total</Text>
            </View>
          </View>
          
          {data.items.map((item, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={styles.tableColDesc}>
                <Text style={styles.tableCellDesc}>{item.description}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{item.quantity}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{formatCurrency(item.price)}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{formatCurrency(item.quantity * item.price)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalBox}>
            <View style={styles.totalRow}>
              <Text>Subtotal:</Text>
              <Text>{formatCurrency(total)}</Text>
            </View>
            <View style={[styles.totalRow, styles.grandTotal]}>
              <Text>Total Geral:</Text>
              <Text>{formatCurrency(total)}</Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {data.notes && (
          <View style={styles.notes}>
            <Text style={styles.sectionTitle}>Observações</Text>
            <Text>{data.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Obrigado pela preferência! Este orçamento tem validade de 15 dias.</Text>
          <Text>Gerado por Refrimix Tecnologia CRM</Text>
        </View>
      </Page>
    </Document>
  );
};
