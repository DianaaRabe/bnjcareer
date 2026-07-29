import React from 'react'
import ReactDOM from 'react-dom/client'
import { ApolloProvider } from '@apollo/client'
import { BrowserRouter } from 'react-router-dom'
import { IntlProvider } from 'react-intl'
import { apolloClient } from './lib/apollo'
import { DEFAULT_LOCALE, locale, localeMessages } from './lib/i18n'
import { App } from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <IntlProvider locale={locale} defaultLocale={DEFAULT_LOCALE} messages={localeMessages}>
      <ApolloProvider client={apolloClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ApolloProvider>
    </IntlProvider>
  </React.StrictMode>,
)
