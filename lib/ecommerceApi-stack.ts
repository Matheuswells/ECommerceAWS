import * as lambdaNode from 'aws-cdk-lib/aws-lambda-nodejs'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import * as cdk from 'aws-cdk-lib'
import * as cw from 'aws-cdk-lib/aws-logs'
import { Construct } from 'constructs'

interface EcommerceApiStackProps extends cdk.StackProps {
    productsFetchHandler: lambdaNode.NodejsFunction
    productsAdminHandler: lambdaNode.NodejsFunction
}

export class EcommerceApiStack extends cdk.Stack {

    constructor(scope: Construct, id: string, props: EcommerceApiStackProps) {
        super(scope, id, props)

        const logGroup = new cw.LogGroup(this, 'ECommerceApiLogs', {})
        const api = new apigateway.RestApi(this, 'ECommerceApi', {
            restApiName: 'e-commerce-api',
            cloudWatchRole: true,
            deployOptions: {
                accessLogDestination: new apigateway.LogGroupLogDestination(logGroup),
                accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields({
                    httpMethod: true,
                    ip: true,
                    protocol: true,
                    requestTime: true,
                    resourcePath: true,
                    responseLength: true,
                    status: true,
                    user: true,
                    caller: true
                 })
            }
        })

        const productsFetchIntegration = new apigateway.LambdaIntegration(props.productsFetchHandler)
        const productsAdminIntegration = new apigateway.LambdaIntegration(props.productsAdminHandler)

        const productsResource = api.root.addResource('products')
        const productIdResource = productsResource.addResource('{id}')
        
        // "GET /products"
        productsResource.addMethod('GET', productsFetchIntegration)

        // "GET /products/{id}"
        productIdResource.addMethod('GET', productsFetchIntegration)

        // "POST /products"
        productsResource.addMethod('POST', productsAdminIntegration)
        
        // "PUT /products/{id}"
        productIdResource.addMethod('PUT', productsAdminIntegration)

        // "DELETE /products/{id}"
        productIdResource.addMethod('DELETE', productsAdminIntegration)

    }
} 