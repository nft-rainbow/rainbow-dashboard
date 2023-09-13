import { BaseModel } from ".";

export interface BillPlanDetail extends BaseModel {
    bill_plan_id: number;
    cost_type: string;
    count: number;
    qps: number;
}

export interface ServicePlan extends BaseModel {
    name: string;
    effective_peroid: number;
    reset_duration: number;
    qps: number;
    price: string;
    server: string;
    bill_plan_details: BillPlanDetail[];
    plan_period?: string;
    reset_period?: string;
}

export interface DataBundleDetail extends BaseModel {
    data_bundle_id: number;
    cost_type: string;
    count: number;
}

export interface ServicePackage extends BaseModel {
    name: string;
    price: string;
    server: string;
    data_bundle_details: DataBundleDetail[];
}

export interface UserServicePlan extends BaseModel {
    user_id: number;
    plan: ServicePlan;
    server_type: string;
    plan_id: number;
    bought_time: string;
    expire_time: string;
    is_auto_renewal: boolean;
}