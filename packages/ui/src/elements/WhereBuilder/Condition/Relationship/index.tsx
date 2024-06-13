'use client'
import type { Where } from 'payload/bundle'
/* eslint-disable @typescript-eslint/no-floating-promises */
import type { PaginatedDocs } from 'payload/bundle'

import QueryString from 'qs'
import React, { useCallback, useEffect, useReducer, useState } from 'react'

import type { Option } from '../../../ReactSelect/types.js'
import type { Props, ValueWithRelation } from './types.js'

import { useDebounce } from '../../../../hooks/useDebounce.js'
import { useConfig } from '../../../../providers/Config/index.js'
import { useTranslation } from '../../../../providers/Translation/index.js'
import { ReactSelect } from '../../../ReactSelect/index.js'
import './index.scss'
import optionsReducer from './optionsReducer.js'

const baseClass = 'condition-value-relationship'

const maxResultsPerRequest = 10

export const RelationshipField: React.FC<Props> = (props) => {
  const { admin: { isSortable } = {}, disabled, hasMany, onChange, relationTo, value } = props

  const {
    collections,
    routes: { api },
    serverURL,
  } = useConfig()

  const hasMultipleRelations = Array.isArray(relationTo)
  const [options, dispatchOptions] = useReducer(optionsReducer, [])
  const [search, setSearch] = useState('')
  const [errorLoading, setErrorLoading] = useState('')
  const [hasLoadedFirstOptions, setHasLoadedFirstOptions] = useState(false)
  const debouncedSearch = useDebounce(search, 300)
  const { i18n, t } = useTranslation()
  const relationSlugs = hasMultipleRelations ? relationTo : [relationTo]
  const initialRelationMap = () => {
    const map: Map<string, number> = new Map()
    relationSlugs.forEach((relation) => {
      map.set(relation, 1)
    })
    return map
  }
  const nextPageByRelationshipRef = React.useRef<Map<string, number>>(initialRelationMap())
  const partiallyLoadedRelationshipSlugs = React.useRef<string[]>(relationSlugs)

  const addOptions = useCallback(
    (data, relation) => {
      const collection = collections.find((coll) => coll.slug === relation)
      dispatchOptions({ type: 'ADD', collection, data, hasMultipleRelations, i18n, relation })
    },
    [collections, hasMultipleRelations, i18n],
  )

  const loadRelationOptions = React.useCallback(
    async ({
      abortController,
      relationSlug,
    }: {
      abortController: AbortController
      relationSlug: string
    }) => {
      const collection = collections.find((coll) => coll.slug === relationSlug)
      const fieldToSearch = collection?.admin?.useAsTitle || 'id'
      const pageIndex = nextPageByRelationshipRef.current.get(relationSlug)

      if (partiallyLoadedRelationshipSlugs.current.includes(relationSlug)) {
        const query: {
          depth?: number
          limit?: number
          page?: number
          where: Where
        } = {
          depth: 0,
          limit: maxResultsPerRequest,
          page: pageIndex,
          where: {
            and: [],
          },
        }

        if (debouncedSearch) {
          query.where.and.push({
            [fieldToSearch]: {
              like: debouncedSearch,
            },
          })
        }

        try {
          const response = await fetch(
            `${serverURL}${api}/${relationSlug}${QueryString.stringify(query, { addQueryPrefix: true })}`,
            {
              credentials: 'include',
              headers: {
                'Accept-Language': i18n.language,
              },
              signal: abortController.signal,
            },
          )

          if (response.ok) {
            const data: PaginatedDocs = await response.json()
            if (data.docs.length > 0) {
              addOptions(data, relationSlug)

              if (!debouncedSearch) {
                if (data.nextPage) {
                  nextPageByRelationshipRef.current.set(relationSlug, data.nextPage)
                } else {
                  partiallyLoadedRelationshipSlugs.current =
                    partiallyLoadedRelationshipSlugs.current.filter(
                      (partiallyLoadedRelation) => partiallyLoadedRelation !== relationSlug,
                    )
                }
              }
            }
          } else {
            setErrorLoading(t('error:unspecific'))
          }
        } catch (e) {
          if (!abortController.signal.aborted) {
            console.error(e)
          }
        }
      }

      setHasLoadedFirstOptions(true)
    },
    [addOptions, api, collections, debouncedSearch, i18n.language, serverURL, t],
  )

  const loadMoreOptions = React.useCallback(() => {
    if (partiallyLoadedRelationshipSlugs.current.length > 0) {
      const abortController = new AbortController()
      loadRelationOptions({
        abortController,
        relationSlug: partiallyLoadedRelationshipSlugs.current[0],
      })
    }
  }, [loadRelationOptions])

  const findOptionsByValue = useCallback((): Option | Option[] => {
    if (value) {
      if (hasMany) {
        if (Array.isArray(value)) {
          return value.map((val) => {
            if (hasMultipleRelations) {
              let matchedOption: Option

              options.forEach((opt) => {
                if (opt.options) {
                  opt.options.some((subOpt) => {
                    if (subOpt?.value === val.value) {
                      matchedOption = subOpt
                      return true
                    }

                    return false
                  })
                }
              })

              return matchedOption
            }

            return options.find((opt) => opt.value === val)
          })
        }

        return undefined
      }

      if (hasMultipleRelations) {
        let matchedOption: Option

        const valueWithRelation = value as ValueWithRelation

        options.forEach((opt) => {
          if (opt?.options) {
            opt.options.some((subOpt) => {
              if (subOpt?.value === valueWithRelation.value) {
                matchedOption = subOpt
                return true
              }
              return false
            })
          }
        })

        return matchedOption
      }

      return options.find((opt) => opt.value === value)
    }

    return undefined
  }, [hasMany, hasMultipleRelations, value, options])

  const handleInputChange = useCallback(
    (newSearch) => {
      if (search !== newSearch) {
        setSearch(newSearch)
      }
    },
    [search],
  )

  const addOptionByID = useCallback(
    async (id, relation) => {
      if (!errorLoading && id !== 'null' && id && relation) {
        const response = await fetch(`${serverURL}${api}/${relation}/${id}?depth=0`, {
          credentials: 'include',
          headers: {
            'Accept-Language': i18n.language,
          },
        })

        if (response.ok) {
          const data = await response.json()
          addOptions({ docs: [data] }, relation)
        } else {
          // eslint-disable-next-line no-console
          console.error(t('error:loadingDocument', { id }))
        }
      }
    },
    [i18n, addOptions, api, errorLoading, serverURL, t],
  )

  /**
   * 1. Trigger initial relationship options fetch
   * 2. When search changes, loadRelationOptions will
   *    fire off again
   */
  useEffect(() => {
    const relations = Array.isArray(relationTo) ? relationTo : [relationTo]
    const abortControllers: AbortController[] = []
    relations.forEach((relation) => {
      const abortController = new AbortController()
      loadRelationOptions({
        abortController,
        relationSlug: relation,
      })
      abortControllers.push(abortController)
    })

    return () => {
      abortControllers.forEach((controller) => {
        if (controller.signal) controller.abort()
      })
    }
  }, [i18n, loadRelationOptions, relationTo])

  /**
   * Load any options that were not returned
   * in the first 10 of each relation fetch
   */
  useEffect(() => {
    if (value && hasLoadedFirstOptions) {
      if (hasMany) {
        const matchedOptions = findOptionsByValue()

        ;((matchedOptions as Option[]) || []).forEach((option, i) => {
          if (!option) {
            if (hasMultipleRelations) {
              addOptionByID(value[i].value, value[i].relationTo)
            } else {
              addOptionByID(value[i], relationTo)
            }
          }
        })
      } else {
        const matchedOption = findOptionsByValue()

        if (!matchedOption) {
          if (hasMultipleRelations) {
            const valueWithRelation = value as ValueWithRelation
            addOptionByID(valueWithRelation.value, valueWithRelation.relationTo)
          } else {
            addOptionByID(value, relationTo)
          }
        }
      }
    }
  }, [
    addOptionByID,
    findOptionsByValue,
    hasMany,
    hasMultipleRelations,
    relationTo,
    value,
    hasLoadedFirstOptions,
  ])

  const classes = ['field-type', baseClass, errorLoading && 'error-loading']
    .filter(Boolean)
    .join(' ')

  const valueToRender = (findOptionsByValue() || value) as Option

  return (
    <div className={classes}>
      {!errorLoading && (
        <ReactSelect
          disabled={disabled}
          isMulti={hasMany}
          isSortable={isSortable}
          onChange={(selected) => {
            if (!selected) {
              onChange(null)
              return
            }
            if (hasMany) {
              onChange(
                selected
                  ? selected.map((option) => {
                      if (hasMultipleRelations) {
                        return {
                          relationTo: option?.relationTo,
                          value: option?.value,
                        }
                      }

                      return option?.value
                    })
                  : null,
              )
            } else if (hasMultipleRelations) {
              onChange({
                relationTo: selected?.relationTo,
                value: selected?.value,
              })
            } else {
              onChange(selected?.value)
            }
          }}
          onInputChange={handleInputChange}
          onMenuScrollToBottom={loadMoreOptions}
          options={options}
          placeholder={t('general:selectValue')}
          value={valueToRender}
        />
      )}
      {errorLoading && <div className={`${baseClass}__error-loading`}>{errorLoading}</div>}
    </div>
  )
}
