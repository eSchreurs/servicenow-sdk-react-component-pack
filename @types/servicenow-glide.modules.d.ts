// Ambient type declarations for ServiceNow Glide server-side APIs.
// These classes are globals in the ServiceNow server execution environment.
// Declarations cover only the methods used in src/server/api/*.ts.

declare class GlideRecord {
    constructor(tableName: string)
    get(value: any): boolean
    addQuery(name: string, value: any): any
    addEncodedQuery(query: string): void
    query(): void
    next(): boolean
    getValue(field: string): any
    getDisplayValue(field?: string): any
    getUniqueValue(): string
    setLimit(limit: number): void
    [key: string]: any
}

declare class GlideTableHierarchy {
    constructor(tableName: string)
    getTables(): any
}

declare class GlideScopedEvaluator {
    constructor()
    evaluateScript(gr: any, field: string, variables?: any): any
    putVariable(name: string, value: any): void
}
