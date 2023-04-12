import { ReactNode } from 'react';
import { ExternalProvider } from '@decipad/graphql-client';
import {
  GoogleSheet,
  MariaDb,
  MongoDb,
  MsSql,
  MySql,
  Oracle,
  OtherSql,
  PostgreSql,
  Redshift,
  WebApi,
} from '@decipad/ui';

interface DataSource {
  name: string;
  icon: ReactNode;
  provider: ExternalProvider | undefined;
}

export const ProviderList: Array<DataSource> = [
  {
    name: 'Google Sheet',
    icon: <img alt="Google Sheet Logo" src={GoogleSheet} />,
    provider: ExternalProvider.Gsheets,
  },
  {
    name: 'Web API',
    icon: <img alt="Web API" src={WebApi} />,
    provider: ExternalProvider.Json,
  },
  {
    name: 'MySQL',
    icon: <img alt="My SQL" src={MySql} />,
    provider: ExternalProvider.Mysql,
  },
  {
    name: 'MongoDB',
    icon: <img alt="Mongo DB" src={MongoDb} />,
    provider: undefined,
  },
  {
    name: 'MSSQL',
    icon: <img alt="Ms Sql" src={MsSql} />,
    provider: undefined,
  },
  {
    name: 'Oracle',
    icon: <img alt="Oracle" src={Oracle} />,
    provider: ExternalProvider.Oracledb,
  },
  {
    name: 'Redshift',
    icon: <img alt="Redshift" src={Redshift} />,
    provider: ExternalProvider.Redshift,
  },
  {
    name: 'Postgres',
    icon: <img alt="Postgres" src={PostgreSql} />,
    provider: ExternalProvider.Postgresql,
  },
  {
    name: 'MariaDB',
    icon: <img alt="Maria Db" src={MariaDb} />,
    provider: ExternalProvider.Mariadb,
  },
  {
    name: 'Other SQL',
    icon: <img alt="Other Sql" src={OtherSql} />,
    provider: undefined,
  },
];
