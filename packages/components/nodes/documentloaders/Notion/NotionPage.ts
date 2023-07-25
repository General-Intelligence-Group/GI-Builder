import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { TextSplitter } from 'langchain/text_splitter'
import { NotionAPILoader, NotionAPILoaderOptions } from 'langchain/document_loaders/web/notionapi'

class NotionPage_DocumentLoaders implements INode {
    label: string
    name: string
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    inputs: INodeParams[]

    constructor() {
        this.label = 'Notion Page'
        this.name = 'notionPage'
        this.type = 'Document'
        this.icon = 'notion.png'
        this.category = 'Document Loaders'
        this.description = 'Load data from Notion Page (including child pages all as separate documents)'
        this.baseClasses = [this.type]
        this.inputs = [
            {
                label: 'Text Splitter',
                name: 'textSplitter',
                type: 'TextSplitter',
                optional: true
            },
            {
                label: 'Notion Integration Token',
                name: 'notionIntegrationToken',
                type: 'password',
                description:
                    'You can find integration token <a target="_blank" href="https://developers.notion.com/docs/create-a-notion-integration#step-1-create-an-integration">here</a>'
            },
            {
                label: 'Notion Page Id',
                name: 'pageId',
                type: 'string',
                description:
                    'The last The 32 char hex in the url path. For example: https://www.notion.so/skarard/LangChain-Notion-API-b34ca03f219c4420a6046fc4bdfdf7b4, b34ca03f219c4420a6046fc4bdfdf7b4 is the Page ID'
            },
            {
                label: 'Metadata',
                name: 'metadata',
                type: 'json',
                optional: true,
                additionalParams: true
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const textSplitter = nodeData.inputs?.textSplitter as TextSplitter
        const pageId = nodeData.inputs?.pageId as string
        const metadata = nodeData.inputs?.metadata
        const notionIntegrationToken = nodeData.inputs?.notionIntegrationToken as string

        const obj: NotionAPILoaderOptions = {
            clientOptions: {
                auth: notionIntegrationToken
            },
            id: pageId,
            type: 'page'
        }
        const loader = new NotionAPILoader(obj)

        let docs = []
        if (textSplitter) {
            docs = await loader.loadAndSplit(textSplitter)
        } else {
            docs = await loader.load()
        }

        if (metadata) {
            const parsedMetadata = typeof metadata === 'object' ? metadata : JSON.parse(metadata)
            let finaldocs = []
            for (const doc of docs) {
                const newdoc = {
                    ...doc,
                    metadata: {
                        ...doc.metadata,
                        ...parsedMetadata
                    }
                }
                finaldocs.push(newdoc)
            }
            return finaldocs
        }

        return docs
    }
}

module.exports = { nodeClass: NotionPage_DocumentLoaders }
