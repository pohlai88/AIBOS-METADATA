/**
 * Event Types
 * Internal event definitions for metadata studio
 */

export interface MetadataChangedEvent {
  type: 'metadata.changed';
  entityId: string;
  changeType: 'created' | 'updated' | 'deleted';
  changedFields?: string[];
  userId?: string;
  timestamp: Date;
}

export interface LineageUpdatedEvent {
  type: 'lineage.updated';
  entityId: string;
  direction: 'upstream' | 'downstream';
  affectedEntities: string[];
  timestamp: Date;
}

export interface ProfileComputedEvent {
  type: 'profile.computed';
  entityId: string;
  qualityScore: number;
  completeness: number;
  timestamp: Date;
}

export interface GovernanceTierChangedEvent {
  type: 'governance.tier.changed';
  entityId: string;
  oldTier: string;
  newTier: string;
  reason?: string;
  timestamp: Date;
}

export type MetadataEvent =
  | MetadataChangedEvent
  | LineageUpdatedEvent
  | ProfileComputedEvent
  | GovernanceTierChangedEvent;

