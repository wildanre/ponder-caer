# Contoh Penggunaan GraphQL Client

## Menggunakan Fetch API (JavaScript/TypeScript)

### Basic Query

```javascript
const query = `
  query GetPools {
    pools {
      id
      collateralToken
      borrowToken
      ltv
      createdAt
    }
  }
`;

const response = await fetch('/api/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query })
});

const data = await response.json();
console.log(data.data.pools);
```

### Query dengan Variables

```javascript
const query = `
  query GetUserPositions($userAddress: String!) {
    userPositions(userAddress: $userAddress) {
      id
      positionAddress
      pool {
        collateralToken
        borrowToken
      }
    }
  }
`;

const variables = {
  userAddress: "0x123..."
};

const response = await fetch('/api/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ 
    query, 
    variables 
  })
});

const data = await response.json();
```

## Menggunakan Apollo Client (React)

### Setup

```bash
npm install @apollo/client graphql
```

```javascript
import { ApolloClient, InMemoryCache, ApolloProvider, gql, useQuery } from '@apollo/client';

const client = new ApolloClient({
  uri: '/api/graphql',
  cache: new InMemoryCache()
});

function App() {
  return (
    <ApolloProvider client={client}>
      <PoolsList />
    </ApolloProvider>
  );
}
```

### Component dengan Query

```javascript
import { useQuery, gql } from '@apollo/client';

const GET_POOLS = gql`
  query GetPools {
    pools {
      id
      collateralToken
      borrowToken
      ltv
      createdAt
    }
  }
`;

function PoolsList() {
  const { loading, error, data } = useQuery(GET_POOLS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      {data.pools.map(pool => (
        <div key={pool.id}>
          <h3>{pool.collateralToken} / {pool.borrowToken}</h3>
          <p>LTV: {pool.ltv}</p>
        </div>
      ))}
    </div>
  );
}
```

## Menggunakan Urql (React)

### Setup

```bash
npm install urql graphql
```

```javascript
import { createClient, Provider, useQuery } from 'urql';

const client = createClient({
  url: '/api/graphql',
});

function App() {
  return (
    <Provider value={client}>
      <UserStats />
    </Provider>
  );
}
```

### Query dengan Variables

```javascript
import { useQuery } from 'urql';

const USER_STATS_QUERY = `
  query GetUserStats($userAddress: String!) {
    userStats(userAddress: $userAddress) {
      totalPositions
      totalLiquiditySupplied
      totalCollateralSupplied
      totalBorrowed
    }
  }
`;

function UserStats({ userAddress }) {
  const [result] = useQuery({
    query: USER_STATS_QUERY,
    variables: { userAddress }
  });

  const { data, fetching, error } = result;

  if (fetching) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h2>User Statistics</h2>
      <p>Total Positions: {data.userStats.totalPositions}</p>
      <p>Total Liquidity: {data.userStats.totalLiquiditySupplied}</p>
      <p>Total Collateral: {data.userStats.totalCollateralSupplied}</p>
      <p>Total Borrowed: {data.userStats.totalBorrowed}</p>
    </div>
  );
}
```

## Menggunakan SWR dengan GraphQL

```javascript
import useSWR from 'swr';

const fetcher = (query, variables = {}) =>
  fetch('/api/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables })
  }).then(res => res.json());

function PoolDetails({ poolAddress }) {
  const query = `
    query GetPoolDetails($address: String!) {
      pool(address: $address) {
        id
        collateralToken
        borrowToken
        ltv
        liquiditySupplies {
          user
          amount
          timestamp
        }
      }
      poolStats(address: $address) {
        totalLiquidity
        totalCollateral
        totalPositions
      }
    }
  `;

  const { data, error, isLoading } = useSWR(
    [query, { address: poolAddress }],
    ([query, variables]) => fetcher(query, variables),
    { refreshInterval: 30000 } // Refresh every 30 seconds
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading pool details</div>;

  const { pool, poolStats } = data.data;

  return (
    <div>
      <h2>Pool Details</h2>
      <p>Collateral: {pool.collateralToken}</p>
      <p>Borrow: {pool.borrowToken}</p>
      <p>LTV: {pool.ltv}</p>
      
      <h3>Statistics</h3>
      <p>Total Liquidity: {poolStats.totalLiquidity}</p>
      <p>Total Collateral: {poolStats.totalCollateral}</p>
      <p>Total Positions: {poolStats.totalPositions}</p>
    </div>
  );
}
```

## Error Handling

```javascript
async function executeQuery(query, variables = {}) {
  try {
    const response = await fetch('/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables })
    });

    const result = await response.json();

    // GraphQL errors
    if (result.errors) {
      console.error('GraphQL Errors:', result.errors);
      throw new Error(result.errors[0].message);
    }

    return result.data;
  } catch (error) {
    console.error('Network Error:', error);
    throw error;
  }
}
```

## TypeScript Types

```typescript
// Types berdasarkan GraphQL schema
interface LendingPool {
  id: string;
  collateralToken: string;
  borrowToken: string;
  ltv: string;
  createdAt: string;
  blockNumber: string;
  transactionHash: string;
}

interface Position {
  id: string;
  user: string;
  positionAddress: string;
  poolAddress: string;
  blockNumber: string;
  transactionHash: string;
  timestamp: string;
  pool?: LendingPool;
}

interface UserStats {
  userAddress: string;
  totalPositions: number;
  totalLiquiditySupplied: string;
  totalCollateralSupplied: string;
  totalBorrowed: string;
  activePositions: number;
}

// Query dengan types
const query = `
  query GetUserPositions($userAddress: String!) {
    userPositions(userAddress: $userAddress) {
      id
      positionAddress
      pool {
        collateralToken
        borrowToken
      }
    }
  }
`;

interface QueryResponse {
  userPositions: Position[];
}

const response = await fetch('/api/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query, variables: { userAddress: '0x123...' } })
});

const data: { data: QueryResponse } = await response.json();
```
