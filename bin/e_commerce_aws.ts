#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { EcommerceApiStack } from '../lib/ecommerceApi-stack';
import { ProductsAppStack } from '../lib/productsApp-stack';

const app = new cdk.App()

const env: cdk.Environment = {
  account: '616059160084',
  region: 'us-east-1'
}
// new ProductsAppStack(app, 'ProductsAppStack')

const tags = {
  cost: 'Ecommerce',
  team: 'Grizzy'
}

const productsAppStack = new ProductsAppStack(app, 'ProductsApp', { env, tags });

const ecommerceApiStack = new EcommerceApiStack(app, 'EcommerceApi', {
  productsFetchHandler: productsAppStack.productsFetchHandler,
  productsAdminHandler: productsAppStack.productsAdminHandler,
  env,
  tags
})

ecommerceApiStack.addDependency(productsAppStack)