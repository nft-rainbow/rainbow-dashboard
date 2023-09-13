import { get, put, post } from './index';
import { groupBy } from 'lodash-es';
import { ServicePackage, ServicePlan, UserServicePlan, Web3ServiceQuota } from '@models/Service';

// 一个组合方法, 获取服务按月套餐, 加油包套餐; 然后按服务分组
// 
export async function getServicePlan2Package(): Promise<{[key: string]: {plans: ServicePlan[], packages: ServicePackage[]}}> {
    const {items: plans} = await getServicePlan();
    for(let i in plans) {
        // 过滤掉测试环境的套餐
        plans[i].bill_plan_details = plans[i].bill_plan_details.filter((p: {cost_type: string}) => p.cost_type.match('test') === null);
        plans[i].plan_period = mapEffectivePeriod(plans[i].effective_peroid); // 套餐周期
        plans[i].reset_period = mapEffectivePeriod(plans[i].reset_duration); // 重置周期
    }

    const {items: packages} = await getServicePackage();
    for(let i in packages) {
        // 过滤掉测试环境的套餐
        packages[i].data_bundle_details = packages[i].data_bundle_details.filter((p: {cost_type: string}) => p.cost_type.match('test') === null);
    }

    const groupedPlans = groupBy(plans, (p: ServicePlan) => p.server);
    const groupedPackages = groupBy(packages, (p: ServicePackage) => p.server);

    let result: {[key: string]: any} = {};
    for(let i in groupedPlans) {
        result[i] = {
            plans: groupedPlans[i].sort((a, b) => Number(a.price) - Number(b.price)),
            packages: (groupedPackages[i] || []).sort((a, b) => Number(a.price) - Number(b.price))
        }
    }
    return result;
}

export function getServicePlan(): Promise<{count: number, items: ServicePlan[]}> {
    return get('/settle/v0/common/bill-plan', {page: 1, limit: 1000});
}

export function getServicePackage(): Promise<{count: number, items: ServicePackage[]}> {
    return get('/settle/v0/common/data-bundle', {page: 1, limit: 1000});
}

export function getUserServicePlan(user_id: number): Promise<UserServicePlan[]> {
    return get('/settle/v0/user/bill-plan', {user_id});
}

export function getUserQuota(user_id: number): Promise<{count: number, items: Web3ServiceQuota[]}> {
    return get('/settle/v0/user/quota', {user_id, page: 1, limit: 1000});
}

export function buyServicePlan(UserId: number, PlanId: number, IsAutoRenewal: boolean = true) {
    return post('/dashboard/users/plan', {UserId, PlanId, IsAutoRenewal});
}

export function updateServiceRenewal(UserId: number, ServerType: number | string, IsAutoRenewal: boolean) {
    return put('/dashboard/users/plan/renew', {UserId, ServerType, IsAutoRenewal});
}

export function buyServicePackage(UserId: number, DataBundleId: number, Count: number = 1) {
    return post('/dashboard/users/bundle', {UserId, DataBundleId, Count});
}

function mapEffectivePeriod(p: number): string {
    switch (p) {
        case 1:
            return '天';
        case 2:
            return '月';
        case 3:
            return '年';
        default:
            return '未知';
    }
}

// every service have main/test network
export enum Web3Service {
    CORE_RPC = 'confura_cspace',
    ESPACE_RPC = 'confura_espace',
    CORE_SCAN = 'scan_cspace',
    ESPACE_SCAN = 'scan_espace',
}

export const ServiceNameMap: {[key: string]: string} = {
    confura_cspace: 'Conflux Core RPC 服务',
    confura_espace: 'Conflux eSpace RPC 服务',
    scan_cspace: 'Conflux Core Scan 数据服务',
    scan_espace: 'Conflux eSpace Scan 数据服务'
};

export const CostTypeToServiceMap: {[key: string]: string} = {
    confura_main_cspace_normal: 'confura_cspace',
    confura_main_espace_normal: 'confura_espace',
    confura_test_cspace_normal: 'confura_cspace',
    confura_test_espace_normal: 'confura_espace',
    scan_main_cspace_normal: "scan_cspace",
    scan_main_espace_normal: "scan_espace",
    scan_test_cspace_normal: 'scan_cspace',
    scan_test_espace_normal: 'scan_espace',
};
