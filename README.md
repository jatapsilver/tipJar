# Proyecto Modulo 4 - EthKipu

**Tip Jar** es una aplicación descentralizada (dApp) que permite a los usuarios enviar propinas en ETH acompañadas de un mensaje. El proyecto está dividido en dos carpetas principales:

front
smartContract

## Url del contrato

https://sepolia.etherscan.io/address/0xE69Cf5b0Bbf075bEb7066d28Fa0272718CF0e651

## Instalacion

Instala las dependencias del proyecto en cada carpeta

```bash
npm install
# o si usas yarn
yarn install
```

## Ejecucion del proyecto

Front en vercel : https://tip-jar-neon.vercel.app/

## Modo desarrollo en local front

```bash
npm run dev
# o si usas yarn
yarn dev
```

## Variables de entorno

para poder ejecutar el deployment del contrato copia las variables en el .env.example y colocas en tu archivo .env y ejecuta

```bash
npx hh compile
npx hh ignition deploy ignition/modules/deploy.ts --network sepolia --verify
```

## Script del contrato

En la carpeta script tenemos el codigo para hacer pruebas en el contrato deployado si no colocas la dirrecion del contrato en tu entorno de variables se haran pruebas en el contrato deployado por Javier Plata

## Test del contrato

Para la ejecucion delos test del aplicativo solo es necesario ejecutar

```bash
npx hh test
```

## Authors

- [@jatapsilver](https://www.github.com/jatapsilver)
