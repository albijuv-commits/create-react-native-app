import { z } from "zod";
import { SPECIALTY_IDS } from "@data/vocab/specialties";

/**
 * Schemi condivisi tra browser e server per la sezione Medici. Tutto ciò che arriva dai
 * servizi esterni (Google Places, OpenStreetMap) passa da qui prima di raggiungere l'interfaccia.
 */

export const RADIUS_OPTIONS_KM = [2, 5, 10, 25] as const;
export type RadiusKm = (typeof RADIUS_OPTIONS_KM)[number];
export const DEFAULT_RADIUS_KM: RadiusKm = 10;

/** Da dove arrivano i risultati: `esempio` sono dati inventati, sempre etichettati come tali */
export const DOCTOR_SOURCES = ["google", "osm", "esempio"] as const;
export type DoctorSource = (typeof DOCTOR_SOURCES)[number];

const latitude = z.number().min(-90).max(90);
const longitude = z.number().min(-180).max(180);

export const doctorSearchRequestSchema = z.object({
  specialty: z.enum(SPECIALTY_IDS),
  lat: latitude,
  lon: longitude,
  radiusKm: z.literal(RADIUS_OPTIONS_KM),
});
export type DoctorSearchRequest = z.infer<typeof doctorSearchRequestSchema>;

const httpUrl = z.url({ protocol: /^https?$/ }).max(600);

export const doctorSchema = z.object({
  id: z.string().min(1).max(200),
  name: z.string().trim().min(1).max(160),
  /** Il servizio non indica il nome: `name` è la categoria (ad esempio «Studio medico») */
  unnamed: z.boolean(),
  category: z.string().min(1).max(60),
  /** Specialità in italiano, quando il servizio le indica */
  specialties: z.array(z.string().min(1).max(60)).max(6),
  address: z.string().min(1).max(200).nullable(),
  lat: latitude,
  lon: longitude,
  /** Distanza dal punto di ricerca (arrotondato), in metri */
  distanceM: z.number().min(0),
  phone: z.object({ display: z.string().min(3).max(40), href: z.string().regex(/^tel:\+?[0-9]{3,15}$/) }).nullable(),
  email: z.email().max(254).nullable(),
  website: httpUrl.nullable(),
  /** Orari leggibili, una riga per gruppo di giorni */
  hours: z.array(z.string().min(1).max(160)).min(1).max(10).nullable(),
  openNow: z.boolean().nullable(),
  rating: z.object({ value: z.number().min(1).max(5), count: z.number().int().min(0) }).nullable(),
  wheelchair: z.boolean().nullable(),
  /** Solo Google: i link al luogo e alle indicazioni su Google Maps */
  googleMaps: z.object({ place: httpUrl.nullable(), directions: httpUrl.nullable() }).nullable(),
  /** Solo Google: i fornitori dei dati da citare accanto al risultato */
  attributions: z.array(z.object({ provider: z.string().min(1).max(120), uri: httpUrl.nullable() })).max(5),
});
export type Doctor = z.infer<typeof doctorSchema>;

export const MAX_DOCTORS = 40;

export const doctorSearchResponseSchema = z.object({
  source: z.enum(DOCTOR_SOURCES),
  doctors: z.array(doctorSchema).max(MAX_DOCTORS),
  /** Perché si vedono dati di un altro servizio o dati di esempio */
  notice: z.string().max(300).nullable(),
});
export type DoctorSearchResponse = z.infer<typeof doctorSearchResponseSchema>;

/* -------------------------------------------------------------- Luoghi */

export const placeRequestSchema = z.object({ q: z.string().trim().min(2).max(80) });

export const placeSchema = z.object({
  label: z.string().min(1).max(120),
  lat: latitude,
  lon: longitude,
});
export type Place = z.infer<typeof placeSchema>;

export const placeResponseSchema = z.object({ place: placeSchema.nullable() });

export const apiErrorSchema = z.object({ message: z.string().max(300) });
