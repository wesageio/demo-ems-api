import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';

import { Rules } from './rules.model';

@Injectable()
export class RulesService {
    constructor(
        @InjectModel('Rules') private readonly rulesModel: Model<Rules>,
    ) {
        this.rulesModel.collection.countDocuments().then(async (res) => {
            if (res === 0) {
                const initialized = await this.insertRule({
                    keyword: 'example',
                    category: 'from',
                    isIgnore: true,
                    isActive: false,
                });
                if (initialized) {
                    console.log('Rule initialized');
                }
            }
        });
    }

    async insertRule(body) {
        const newRule = new this.rulesModel({
            keyword: body.keyword,
            category: body.category,
            isIgnore: body.isIgnore,
            isActive: body.isActive,
            matching: body.matching,
        });
        const result = await newRule.save();
        return result;
    }

    async getRules(filter: string, limit: string, page: string, orderBy: string, orderDir: string) {
        const filterData = JSON.parse(filter);
        filterData.isDeleted = false;
        const maxNumber = parseInt(limit);
        const skipNumber = (parseInt(page) - 1) * parseInt(limit);
        const sortData = {
            [orderBy]: orderDir,
        };

        const data = await this.rulesModel
            .find(filterData)
            .limit(maxNumber)
            .skip(skipNumber)
            .sort(sortData).exec();
        const count = await this.rulesModel.countDocuments();
        return {
            data,
            count,
        };
    }

    async getManyRules(filter: any) {
        const data = await this.rulesModel
            .find({
                $and: [
                    { _id: { $in: filter.id } },
                    { isDeleted: false},
                ],
            })
            .exec();
        const count = await this.rulesModel.countDocuments();
        return {
            data,
            count,
        };
    }

    async getRule(ruleId: string) {
        const rule = await this.findRule(ruleId);
        return { rule };
    }

    async updateRule(id, body): Promise<any> {
        return await this.rulesModel.findByIdAndUpdate(id, body, { new: true });
        // await axios.post('http://127.0.0.1:5000/rules/update');
    }

    async deleteRule(ruleId: string) {
        // await axios.post('http://127.0.0.1:5000/rules/update');
        return await this.rulesModel.deleteOne({ _id: ruleId }).exec();
    }

    async deleteRules(ruleIds): Promise<any> {
        const { ids } = ruleIds;
        // return await this.rulesModel.deleteMany({ _id: { $in: ids } });
        return await this.rulesModel.updateMany(
            { _id: { $in: ids }},
            { $set: { isDeleted: true}},
            { multi: true },
        );
    }

    private async findRule(id: string): Promise<Rules> {
        let rule;
        try {
            rule = await this.rulesModel.findById(id).exec();
        } catch (error) {
            throw new NotFoundException('Could not find rule.');
        }
        if (!rule) {
            throw new NotFoundException('Could not find rule.');
        }
        return rule;
    }
}
