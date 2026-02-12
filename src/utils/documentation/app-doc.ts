import { INestApplication } from '@nestjs/common';
import { ModulesContainer, Reflector } from '@nestjs/core';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { DECORATORS } from '@nestjs/swagger/dist/constants';
import { apiReference } from '@scalar/nestjs-api-reference';
import { customCss } from './cssDocs';
import * as fs from 'fs';
import * as path from 'path';

export class AppDoc {
  private document: OpenAPIObject | Record<string, any>;

  constructor(private readonly app: INestApplication) {
    this.init();
  }

  private init() {
    const config = new DocumentBuilder()
      .setTitle(process.env.APP_NAME || 'API')
      .setDescription('Documentação StarSoft Challenge')
      .setVersion(process.env.APP_VERSION || '0.0')
      .addBearerAuth()
      .addBasicAuth()
      .addTag('Login')
      .build();

    this.document = SwaggerModule.createDocument(this.app, config);

    this.parseGroups();

    this.app.getHttpAdapter().get('/openapi.json', (_req, res) => {
      res.json(this.document);
    });

    this.app.use(
      '/api-docs',
      apiReference({
        layout: 'modern',
        theme: 'mars',
        url: '/openapi.json',
        darkMode: true,
        hideModels: true,
        hideDownloadButton: true,
        customCss,
        metaData: {
          title: 'Starsoft Challenge',
          description: 'Documentação da API',
        },
      }),
    );
  }

  private parseGroups() {
    const modulos = this.app.get<ModulesContainer>(ModulesContainer);
    const reflector = this.app.get(Reflector);
    const groupsMap = new Map<string, Set<string>>();
    for (const modulo of modulos.values()) {
      for (const wrapper of modulo.controllers.values()) {
        const metatype = wrapper.metatype;
        if (!metatype) continue;
        const tags =
          reflector.get<string[]>(DECORATORS.API_TAGS, metatype) || [];

        if (tags.length !== 1) {
          console.warn(
            `Controller ${metatype.name} deve ter exatamente uma tag definida.`,
          );
          continue;
        }

        const tag = tags[0];
        const tagNameParts = tag.split('/');
        if (tagNameParts.length >= 2) {
          const grupo = tagNameParts[0];
          if (!groupsMap.has(grupo)) {
            groupsMap.set(grupo, new Set());
          }
          tags.forEach((tag) => groupsMap.get(grupo)!.add(tag));
        }
      }
    }
    this.document['x-tagGroups'] = Array.from(groupsMap.entries()).map(
      ([name, tags]) => ({
        name,
        tags: Array.from(tags).sort((a, b) => a.localeCompare(b)),
      }),
    );
  }

  /**
   * Retorna o número total de rotas documentadas.
   * @returns Número total de rotas.
   */
  public getTotalRoutes(): number {
    return Object.keys(this.document.paths || {}).length;
  }

  /**
   * Retorna o documento OpenAPI gerado.
   * @returns Documento OpenAPI.
   */
  public getDocument(): OpenAPIObject | Record<string, any> {
    return this.document;
  }
}
