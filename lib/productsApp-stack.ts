import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as lambdaNode from 'aws-cdk-lib/aws-lambda-nodejs'
import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as dynadb from 'aws-cdk-lib/aws-dynamodb'

export class ProductsAppStack extends cdk.Stack {  
    readonly productsFetchHandler: lambdaNode.NodejsFunction
    readonly productsAdminHandler: lambdaNode.NodejsFunction
    readonly productsDdb: dynadb.Table

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props)

        this.productsDdb = new dynadb.Table(this, 'ProductsDdb', {
            tableName: 'products',
            partitionKey: {
                name: 'id',
                type: dynadb.AttributeType.STRING
            },
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            billingMode: dynadb.BillingMode.PAY_PER_REQUEST,
            readCapacity: 1,
            writeCapacity: 1

        })

        this.productsFetchHandler = new lambdaNode.NodejsFunction(this, 'ProductsFetchHandler', {
            runtime: lambda.Runtime.NODEJS_16_X,
            functionName: 'products-fetch-handler',
            entry: 'lambda/products/productsFetchFunction.ts',
            handler: "handler",
            memorySize: 128,
            timeout: cdk.Duration.seconds(5),
            bundling: {
                minify: true,
                sourceMap: false
            },
            environment: {
                PRODUCTS_TABLE_NAME: this.productsDdb.tableName
            }
        })

        this.productsAdminHandler = new lambdaNode.NodejsFunction(this, 'ProductsAdminHandler', {
            runtime: lambda.Runtime.NODEJS_16_X,
            functionName: 'products-admin-handler',
            entry: 'lambda/products/productsAdminFunction.ts',
            handler: "handler",
            memorySize: 128,
            timeout: cdk.Duration.seconds(5),
            bundling: {
                minify: true,
                sourceMap: false
            },
            environment: {
                PRODUCTS_TABLE_NAME: this.productsDdb.tableName
            }
        })

        this.productsDdb.grantReadData(this.productsFetchHandler)
        this.productsDdb.grantReadWriteData(this.productsAdminHandler)
    }
}