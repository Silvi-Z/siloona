import { wdBeigeDefaultData } from './invitations/wd-beige/data'
import { wdBeigeSections } from './invitations/wd-beige/sections'
import { bdAnimalsDefaultData } from './invitations/bd-animals/data'
import { bdAnimalsSections } from './invitations/bd-animals/sections'
import { gpBalloonsDefaultData } from './invitations/gp-balloons/data'
import { gpBalloonsSections } from './invitations/gp-balloons/sections'
import { bdDuckDefaultData } from './invitations/bd-duck/data'
import { bdDuckSections } from './invitations/bd-duck/sections'
import { bpBlueDefaultData } from './invitations/bp-blue/data'
import { bpBlueSections } from './invitations/bp-blue/sections'
import { wdGardenSoftDefaultData } from './invitations/wd-garden-soft/data'
import { wdGardenSoftSections } from './invitations/wd-garden-soft/sections'
import { wdGreenDefaultData } from './invitations/wd-green/data'
import { wdGreenSections } from './invitations/wd-green/sections'
import { wdGardenDefaultData } from './invitations/wd-garden/data'
import { wdGardenSections } from './invitations/wd-garden/sections'
import { wdTulipDefaultData } from './invitations/wd-tulip/data'
import { wdTulipSections } from './invitations/wd-tulip/sections'
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
import { gpStorkDefaultData } from './invitations/gp-stork/data'
import { gpStorkSections } from './invitations/gp-stork/sections'
import { ceOrnamentDefaultData } from './invitations/ce-ornament/data'
import { ceOrnamentSections } from './invitations/ce-ornament/sections'
import { cardMouseDefaultData } from './invitations/card-mouse/data'
import { cardMouseSections } from './invitations/card-mouse/sections'

// Each design's default (demo) content and its section structure, keyed
// by preview slug. Kept apart from invitationRegistry.js — which also
// imports every design's heavy component — so the dashboard can compute an
// event's invitation content and build its editor without bundling the
// designs themselves.
export const INVITATION_DEFAULTS = {
  'wd-beige': wdBeigeDefaultData,
  'bd-animals': bdAnimalsDefaultData,
  'gp-balloons': gpBalloonsDefaultData,
  'bd-duck': bdDuckDefaultData,
  'bp-blue': bpBlueDefaultData,
  'wd-garden-soft': wdGardenSoftDefaultData,
  'wd-green': wdGreenDefaultData,
  'wd-garden': wdGardenDefaultData,
  'wd-tulip': wdTulipDefaultData,
  'wd-velvet': wdVelvetDefaultData,
  'wd-line': wdLineDefaultData,
  'wd-calla': wdCallaDefaultData,
  'wd-meadow': wdMeadowDefaultData,
  'bd-planet': bdPlanetDefaultData,
  'bd-balloons': bdBalloonsDefaultData,
  'bd-stitch': bdStitchDefaultData,
  'bd-cars': bdCarsDefaultData,
  'bd-build': bdBuildDefaultData,
  'gp-stork': gpStorkDefaultData,
  'ce-ornament': ceOrnamentDefaultData,
  'card-mouse': cardMouseDefaultData,
}

export const INVITATION_SECTIONS = {
  'wd-beige': wdBeigeSections,
  'bd-animals': bdAnimalsSections,
  'gp-balloons': gpBalloonsSections,
  'bd-duck': bdDuckSections,
  'bp-blue': bpBlueSections,
  'wd-garden-soft': wdGardenSoftSections,
  'wd-green': wdGreenSections,
  'wd-garden': wdGardenSections,
  'wd-tulip': wdTulipSections,
  'wd-velvet': wdVelvetSections,
  'wd-line': wdLineSections,
  'wd-calla': wdCallaSections,
  'wd-meadow': wdMeadowSections,
  'bd-planet': bdPlanetSections,
  'bd-balloons': bdBalloonsSections,
  'bd-stitch': bdStitchSections,
  'bd-cars': bdCarsSections,
  'bd-build': bdBuildSections,
  'gp-stork': gpStorkSections,
  'ce-ornament': ceOrnamentSections,
  'card-mouse': cardMouseSections,
}
