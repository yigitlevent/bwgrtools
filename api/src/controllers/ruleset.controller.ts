import { GetAbilities } from "../services/abilities.service";
import { GetDoWActions } from "../services/dowActions.service";
import { GetFightActions } from "../services/fightActions.service";
import { GetLifepaths } from "../services/lifepaths.service";
import { GetPractices } from "../services/practices.service";
import { GetQuestions } from "../services/questions.service";
import { GetRaCActions } from "../services/racActions.service";
import { GetResources } from "../services/resources.service";
import { GetRulesets } from "../services/rulesets.service";
import { GetSettings } from "../services/settings.service";
import { GetSkills } from "../services/skills.service";
import { GetAltSpellFacets } from "../services/spellFacets.alt.service";
import { GetSpellFacets } from "../services/spellFacets.service";
import { GetStocks } from "../services/stocks.service";
import { GetTraits } from "../services/traits.service";
import { ApiVersion } from "../utils/apiVersion";
import { HandleControllerError } from "../utils/controllerError";
import { Logger } from "../utils/logger";

import type { FastifyRequest, FastifyReply } from "fastify";


export async function GetRulesetsData(request: FastifyRequest<{ Body: { rulesets: dat.RulesetId[]; }; }>, reply: FastifyReply): Promise<void> {
  try {
    const log = new Logger("➞ GetRulesetsData", true);
    const { rulesets } = request.body;

    const abilities = await GetAbilities();
    const stocks = await GetStocks(rulesets);
    const settings = await GetSettings(rulesets);
    const skills = await GetSkills(rulesets);
    const traits = await GetTraits(rulesets);
    const lifepaths = await GetLifepaths(rulesets);
    const resources = await GetResources(rulesets);
    const spellFacets = await GetSpellFacets();
    const spellAltFacets = await GetAltSpellFacets();
    const dowActions = await GetDoWActions();
    const racActions = await GetRaCActions();
    const fightActions = await GetFightActions();
    const practices = await GetPractices();
    const questions = await GetQuestions();

    const responseData: RulesetResponse = { ruleset: { abilities, stocks, settings, skills, traits, lifepaths, resources, spellFacets, spellAltFacets, dowActions, racActions, fightActions, practices, questions } };
    log.end();

    reply.code(200).send(responseData);
  }
  catch (e) {
    HandleControllerError(request, reply, e, { status: 403 });
  }
}

export async function GetRulesetsList(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const data = await GetRulesets();

    const responseData: RulesetsResponse = { version: ApiVersion, rulesets: data };

    reply.code(200).send(responseData);
  }
  catch (e) {
    HandleControllerError(request, reply, e, { status: 403 });
  }
}
