import {
  Box,
  Card,
  Heading,
  Text,
  Button,
  Table,
  TableHeader,
  TableHeaderRow,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Badge,
  Divider,
  Avatar,
  DownloadIcon,
  ChevronDownIcon,
  CardHeader,
  CardBody,
  CardFooter,
  CardHeaderLeading,
  CardHeaderTrailing,
  CardHeaderIconButton,
} from '@razorpay/blade/components';
import React from 'react';

const transactions = [
  {
    id: 'TXN001',
    customer: 'John Doe',
    amount: '₹2,500',
    status: 'Success',
    date: '2024-06-01',
  },
  {
    id: 'TXN002',
    customer: 'Jane Smith',
    amount: '₹1,200',
    status: 'Failed',
    date: '2024-06-02',
  },
  {
    id: 'TXN003',
    customer: 'Acme Corp',
    amount: '₹5,000',
    status: 'Refunded',
    date: '2024-06-03',
  },
  {
    id: 'TXN004',
    customer: 'Ravi Kumar',
    amount: '₹3,750',
    status: 'Success',
    date: '2024-06-04',
  },
];

const summary = [
  { label: 'Total Revenue', value: '₹12,450' },
  { label: 'Transactions', value: '4' },
  { label: 'Refunds', value: '1' },
];

const statusColor = {
  Success: 'positive',
  Failed: 'negative',
  Refunded: 'notice',
} as const;

type SidebarProps = {
  activeSection: string;
  setActiveSection: (section: string) => void;
};

const Sidebar = ({ activeSection, setActiveSection }: SidebarProps) => (
  <Box
    as="nav"
    backgroundColor="surface.background.gray.subtle"
    minHeight="100vh"
    width="240px"
    paddingY="spacing.7"
    paddingX="spacing.5"
    borderRightWidth="thin"
    borderRightColor="surface.border.gray.subtle"
    display={{ base: 'none', m: 'block' }}
  >
    <Heading size="small" marginBottom="spacing.8" color="surface.text.primary.normal">
      Razorpay
    </Heading>
    <Button
      variant="tertiary"
      isFullWidth
      onClick={() => setActiveSection('dashboard')}
      size="medium"
      marginBottom="spacing.6"
      color={activeSection === 'dashboard' ? 'primary' : undefined}
    >
      Dashboard
    </Button>
    <Button
      variant="tertiary"
      isFullWidth
      onClick={() => setActiveSection('transactions')}
      size="medium"
      marginBottom="spacing.6"
      color={activeSection === 'transactions' ? 'primary' : undefined}
    >
      Transactions
    </Button>
    <Button
      variant="tertiary"
      isFullWidth
      onClick={() => setActiveSection('settlements')}
      size="medium"
      marginBottom="spacing.6"
      color={activeSection === 'settlements' ? 'primary' : undefined}
    >
      Settlements
    </Button>
    <Button
      variant="tertiary"
      isFullWidth
      onClick={() => setActiveSection('settings')}
      size="medium"
      color={activeSection === 'settings' ? 'primary' : undefined}
    >
      Settings
    </Button>
  </Box>
);

const TopBar = () => (
  <Box
    as="header"
    display="flex"
    alignItems="center"
    justifyContent="space-between"
    paddingY="spacing.5"
    paddingX="spacing.7"
    backgroundColor="surface.background.gray.subtle"
    borderBottomWidth="thin"
    borderBottomColor="surface.border.gray.subtle"
  >
    <Heading size="small">Merchant Dashboard</Heading>
    <Box display="flex" alignItems="center" gap="spacing.5">
      <Avatar name="Manish Reddy" size="small" />
      <IconButton icon={ChevronDownIcon} accessibilityLabel="Account" onClick={() => {}} />
    </Box>
  </Box>
);

const SummaryCards = () => (
  <Box display="flex" gap="spacing.6" marginY="spacing.7" flexWrap="wrap">
    {summary.map((item) => (
      <Card key={item.label} padding="spacing.7" minWidth="180px">
        <CardBody>
          <Text size="small" color="surface.text.gray.subtle">{item.label}</Text>
          <Heading size="medium">{item.value}</Heading>
        </CardBody>
      </Card>
    ))}
  </Box>
);

const TransactionsTable = () => (
  <Card>
    <CardHeader>
      <CardHeaderLeading title="Recent Transactions" />
      <CardHeaderTrailing
        visual={
          <CardHeaderIconButton
            icon={DownloadIcon}
            accessibilityLabel="Export"
            onClick={() => {}}
          />
        }
      />
    </CardHeader>
    <CardBody>
      <Divider marginBottom="spacing.5" />
      <Table
        data={{ nodes: transactions.map((txn) => ({ ...txn, id: txn.id })) }}
        showStripedRows
      >
        {(tableData) => (
          <>
            <TableHeader>
              <TableHeaderRow>
                <TableHeaderCell>Transaction ID</TableHeaderCell>
                <TableHeaderCell>Customer</TableHeaderCell>
                <TableHeaderCell>Amount</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Date</TableHeaderCell>
              </TableHeaderRow>
            </TableHeader>
            <TableBody>
              {tableData.map((txn) => (
                <TableRow key={txn.id} item={txn}>
                  <TableCell>{txn.id}</TableCell>
                  <TableCell>{txn.customer}</TableCell>
                  <TableCell>{txn.amount}</TableCell>
                  <TableCell>
                    <Badge color={statusColor[txn.status as keyof typeof statusColor]}>{txn.status}</Badge>
                  </TableCell>
                  <TableCell>{txn.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </>
        )}
      </Table>
    </CardBody>
  </Card>
);

type MainContentProps = {
  activeSection: string;
};

const MainContent = ({ activeSection }: MainContentProps) => {
  if (activeSection === 'dashboard') {
    return <SummaryCards />;
  }
  if (activeSection === 'transactions') {
    return <TransactionsTable />;
  }
  if (activeSection === 'settlements') {
    return (
      <Box paddingTop="spacing.7">
        <Card padding="spacing.7">
          <CardBody>
            <Heading size="small">Settlements</Heading>
            <Text marginTop="spacing.4">Dummy settlements data goes here.</Text>
          </CardBody>
        </Card>
      </Box>
    );
  }
  if (activeSection === 'settings') {
    return (
      <Box paddingTop="spacing.7">
        <Card padding="spacing.7">
          <CardBody>
            <Heading size="small">Settings</Heading>
            <Text marginTop="spacing.4">Dummy settings data goes here.</Text>
          </CardBody>
        </Card>
      </Box>
    );
  }
  return null;
};

const App = () => {
  const [activeSection, setActiveSection] = React.useState('dashboard');
  return (
    <Box display="flex" minHeight="100vh" backgroundColor="surface.background.gray.subtle">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <Box flexGrow={1}>
        <TopBar />
        <Box padding="spacing.8">
          <MainContent activeSection={activeSection} />
        </Box>
      </Box>
    </Box>
  );
};

export default App;
