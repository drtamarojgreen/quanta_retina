export interface WorkflowNode {
    id: string;
    type: string;
    left: string;
    top: string;
    width?: string;
    height?: string;
    title: string;
    src?: string;
}

export interface Connection {
    id: string;
    from: string;
    to: string;
    type: string;
}

export interface WorkflowState {
    nodes: WorkflowNode[];
    connections: Connection[];
}

export interface ViewState {
    x: number;
    y: number;
    scale: number;
}

export interface Point {
    x: number;
    y: number;
}
