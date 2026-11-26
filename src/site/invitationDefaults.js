import { wdBeigeDefaultData } from './invitations/wd-beige/data'
import { wdBeigeSections } from './invitations/wd-beige/sections'
import { bdAnimalsDefaultData } from './invitations/bd-animals/data'
import { bdAnimalsSections } from './invitations/bd-animals/sections'
import { gpBalloonsDefaultData } from './invitations/gp-balloons/data'
import { gpBalloonsSections } from './invitations/gp-balloons/sections'
import { bpBlueDefaultData } from './invitations/bp-blue/data'
import { bpBlueSections } from './invitations/bp-blue/sections'
import { wdGreenDefaultData } from './invitations/wd-green/data'
import { wdGreenSections } from './invitations/wd-green/sections'
import { wdGardenDefaultData } from './invitations/wd-garden/data'
import { wdGardenSections } from './invitations/wd-garden/sections'
import { wdMonoDefaultData } from './invitations/wd-mono/data'
import { wdMonoSections } from './invitations/wd-mono/sections'
import { wdRougeDefaultData } from './invitations/wd-rouge/data'
import { wdRougeSections } from './invitations/wd-rouge/sections'
import { wdCherryDefaultData } from './invitations/wd-cherry/data'
import { wdCherrySections } from './invitations/wd-cherry/sections'
import { wdPortraitDefaultData } from './invitations/wd-portrait/data'
import { wdPortraitSections } from './invitations/wd-portrait/sections'
import { wdVelvetDefaultData } from './invitations/wd-velvet/data'
import { wdVelvetSections } from './invitations/wd-velvet/sections'
import { wdLineDefaultData } from './invitations/wd-line/data'
import { wdLineSections } from './invitations/wd-line/sections'
import { wdCallaDefaultData } from './invitations/wd-calla/data'
import { wdCallaSections } from './invitations/wd-calla/sections'
import { wdMeadowDefaultData } from './invitations/wd-meadow/data'
import { wdMeadowSections } from './invitations/wd-meadow/sections'
import { bdPlanetDefaultData } from './invitations/bd-planet/data'
import { bdPlanetSections } from './invitations/bd-planet/sections'
import { bdBalloonsDefaultData } from './invitations/bd-balloons/data'
import { bdBalloonsSections } from './invitations/bd-balloons/sections'
import { bdStitchDefaultData } from './invitations/bd-stitch/data'
import { bdStitchSections } from './invitations/bd-stitch/sections'
import { bdCarsDefaultData } from './invitations/bd-cars/data'
import { bdCarsSections } from './invitations/bd-cars/sections'
import { bdBuildDefaultData } from './invitations/bd-build/data'
import { bdBuildSections } from './invitations/bd-build/sections'
import { bdCastleDefaultData } from './invitations/bd-castle/data'
import { bdCastleSections } from './invitations/bd-castle/sections'
import { bdDotsDefaultData } from './invitations/bd-dots/data'
import { bdDotsSections } from './invitations/bd-dots/sections'
import { gpStorkDefaultData } from './invitations/gp-stork/data'
import { gpStorkSections } from './invitations/gp-stork/sections'
import { ceGarlandDefaultData } from './invitations/ce-garland/data'
import { ceGarlandSections } from './invitations/ce-garland/sections'
import { cePineDefaultData } from './invitations/ce-pine/data'
import { cePineSections } from './invitations/ce-pine/sections'
import { ceTruckDefaultData } from './invitations/ce-truck/data'
import { ceTruckSections } from './invitations/ce-truck/sections'
import { ceToastDefaultData } from './invitations/ce-toast/data'
import { ceToastSections } from './invitations/ce-toast/sections'
import { ceHollyDefaultData } from './invitations/ce-holly/data'
import { ceHollySections } from './invitations/ce-holly/sections'
import { wdChateauDefaultData } from './invitations/wd-chateau/data'
import { wdChateauSections } from './invitations/wd-chateau/sections'
import { wdNoirDefaultData } from './invitations/wd-noir/data'
import { wdNoirSections } from './invitations/wd-noir/sections'
import { wdNoirLiteDefaultData } from './invitations/wd-noir-lite/data'
import { wdNoirLiteSections } from './invitations/wd-noir-lite/sections'
import { ceGroovyDefaultData } from './invitations/ce-groovy/data'
import { ceGroovySections } from './invitations/ce-groovy/sections'
import { ceJingleDefaultData } from './invitations/ce-jingle/data'
import { ceJingleSections } from './invitations/ce-jingle/sections'
import { ceSparkleDefaultData } from './invitations/ce-sparkle/data'
import { ceSparkleSections } from './invitations/ce-sparkle/sections'
import { ceCozyDefaultData } from './invitations/ce-cozy/data'
import { ceCozySections } from './invitations/ce-cozy/sections'
import { cardMouseDefaultData } from './invitations/card-mouse/data'
import { cardMouseSections } from './invitations/card-mouse/sections'
import { bdCastleRu, bdCastleEn } from './invitations/bd-castle/data.i18n'
import { cePineRu, cePineEn } from './invitations/ce-pine/data.i18n'
import { bdDotsRu, bdDotsEn } from './invitations/bd-dots/data.i18n'
import { ceTruckRu, ceTruckEn } from './invitations/ce-truck/data.i18n'
import { ceToastRu, ceToastEn } from './invitations/ce-toast/data.i18n'
import { ceHollyRu, ceHollyEn } from './invitations/ce-holly/data.i18n'
import { wdChateauRu, wdChateauEn } from './invitations/wd-chateau/data.i18n'
import { ceGroovyRu, ceGroovyEn } from './invitations/ce-groovy/data.i18n'
import { ceJingleRu, ceJingleEn } from './invitations/ce-jingle/data.i18n'

// Each design's default (demo) content and its section structure, keyed
// by preview slug. Kept apart from invitationRegistry.js — which also
// imports every design's heavy component — so the dashboard can compute an
// event's invitation content and build its editor without bundling the
// designs themselves.
export const INVITATION_DEFAULTS = {
  'wd-beige': wdBeigeDefaultData,
  'bd-animals': bdAnimalsDefaultData,
  'gp-balloons': gpBalloonsDefaultData,
  'bp-blue': bpBlueDefaultData,
  'wd-green': wdGreenDefaultData,
  'wd-garden': wdGardenDefaultData,
  'wd-mono': wdMonoDefaultData,
  'wd-rouge': wdRougeDefaultData,
  'wd-cherry': wdCherryDefaultData,
  'wd-portrait': wdPortraitDefaultData,
  'wd-velvet': wdVelvetDefaultData,
  'wd-line': wdLineDefaultData,
  'wd-calla': wdCallaDefaultData,
  'wd-meadow': wdMeadowDefaultData,
  'bd-planet': bdPlanetDefaultData,
  'bd-balloons': bdBalloonsDefaultData,
  'bd-stitch': bdStitchDefaultData,
  'bd-cars': bdCarsDefaultData,
  'bd-build': bdBuildDefaultData,
  'bd-castle': bdCastleDefaultData,
  'gp-stork': gpStorkDefaultData,
  'ce-garland': ceGarlandDefaultData,
  'ce-pine': cePineDefaultData,
  'bd-dots': bdDotsDefaultData,
  'ce-truck': ceTruckDefaultData,
  'ce-toast': ceToastDefaultData,
  'ce-holly': ceHollyDefaultData,
  'wd-chateau': wdChateauDefaultData,
  'wd-noir': wdNoirDefaultData,
  'wd-noir-lite': wdNoirLiteDefaultData,
  'ce-groovy': ceGroovyDefaultData,
  'ce-jingle': ceJingleDefaultData,
  'ce-sparkle': ceSparkleDefaultData,
  'ce-cozy': ceCozyDefaultData,
  'card-mouse': cardMouseDefaultData,
}

export const INVITATION_SECTIONS = {
  'wd-beige': wdBeigeSections,
  'bd-animals': bdAnimalsSections,
  'gp-balloons': gpBalloonsSections,
  'bp-blue': bpBlueSections,
  'wd-green': wdGreenSections,
  'wd-garden': wdGardenSections,
  'wd-mono': wdMonoSections,
  'wd-rouge': wdRougeSections,
  'wd-cherry': wdCherrySections,
  'wd-portrait': wdPortraitSections,
  'wd-velvet': wdVelvetSections,
  'wd-line': wdLineSections,
  'wd-calla': wdCallaSections,
  'wd-meadow': wdMeadowSections,
  'bd-planet': bdPlanetSections,
  'bd-balloons': bdBalloonsSections,
  'bd-stitch': bdStitchSections,
  'bd-cars': bdCarsSections,
  'bd-build': bdBuildSections,
  'bd-castle': bdCastleSections,
  'gp-stork': gpStorkSections,
  'ce-garland': ceGarlandSections,
  'ce-pine': cePineSections,
  'bd-dots': bdDotsSections,
  'ce-truck': ceTruckSections,
  'ce-toast': ceToastSections,
  'ce-holly': ceHollySections,
  'wd-chateau': wdChateauSections,
  'wd-noir': wdNoirSections,
  'wd-noir-lite': wdNoirLiteSections,
  'ce-groovy': ceGroovySections,
  'ce-jingle': ceJingleSections,
  'ce-sparkle': ceSparkleSections,
  'ce-cozy': ceCozySections,
  'card-mouse': cardMouseSections,
}

// ---------------------------------------------------------------------------
// Invitation languages. A design's Russian / English demo content lives next
// to its Armenian data.js (data.ru.js, data.en.js) and carries `lang`, which
// rides along in the customer's edits into the order — so the guest's /i/
// page knows which language to build the invitation in. Armenian content has
// no `lang`. A design not listed here is Armenian only.
export const INVITATION_DEFAULTS_I18N = {
  'bd-castle': { ru: bdCastleRu, en: bdCastleEn },
  'ce-pine': { ru: cePineRu, en: cePineEn },
  'bd-dots': { ru: bdDotsRu, en: bdDotsEn },
  'ce-truck': { ru: ceTruckRu, en: ceTruckEn },
  'ce-toast': { ru: ceToastRu, en: ceToastEn },
  'ce-holly': { ru: ceHollyRu, en: ceHollyEn },
  'wd-chateau': { ru: wdChateauRu, en: wdChateauEn },
  'ce-groovy': { ru: ceGroovyRu, en: ceGroovyEn },
  'ce-jingle': { ru: ceJingleRu, en: ceJingleEn },
}

// The languages a design's invitation can be in: always 'hy', then the others.
export function invitationLangs(slug) {
  return ['hy', ...Object.keys(INVITATION_DEFAULTS_I18N[slug] || {})]
}

// The language the invitation will be in for a page in `lang`: that
// language if the design has it, else Armenian.
export function invitationLang(slug, lang) {
  return INVITATION_DEFAULTS_I18N[slug]?.[lang] ? lang : 'hy'
}

// The demo content in that language (Armenian if the design doesn't have it).
export function defaultsFor(slug, lang = 'hy') {
  return INVITATION_DEFAULTS_I18N[slug]?.[lang] || INVITATION_DEFAULTS[slug]
}
