import { describe, expect, it } from 'vitest'
import {
  detectMessageFormat,
  extractCodeText,
} from './detect-message-format'

describe('detectMessageFormat', () => {
  it('does not use keyword-based code autodetection', () => {
    expect(detectMessageFormat('const total = items.length\nreturn total')).toBe(
      'text',
    )
  })

  it('returns text for plain assistant message', () => {
    expect(
      detectMessageFormat('Нужно уточнить формат данных и целевую платформу.'),
    ).toBe('text')
  })

  it('treats fenced code block as code-only response', () => {
    expect(detectMessageFormat('```ts\nconst answer = 42\n```')).toBe('code')
  })

  it('treats lua wrapper as code-only response', () => {
    expect(detectMessageFormat('lua{return wf.vars.answer}lua')).toBe('code')
  })
})

describe('extractCodeText', () => {
  it('returns code body without fences', () => {
    expect(extractCodeText('```ts\nconst answer = 42\n```')).toBe(
      'const answer = 42',
    )
  })

  it('formats lua wrapper into readable multi-line code', () => {
    expect(
      extractCodeText(
        'lua{local result = wf.vars.RESTbody.result\nfor _, filteredEntry in pairs(result) do\nfor key, value in pairs(filteredEntry) do\nif key == "ID" or key == "ENTITY_ID" or key == "CALL" then\nfilteredEntry[key] = nil\nend\nend\nend\nreturn result}lua',
      ),
    ).toBe(
      'local result = wf.vars.RESTbody.result\n' +
        'for _, filteredEntry in pairs(result) do\n' +
        '  for key, value in pairs(filteredEntry) do\n' +
        '    if key == "ID" or key == "ENTITY_ID" or key == "CALL" then\n' +
        '      filteredEntry[key] = nil\n' +
        '    end\n' +
        '  end\n' +
        'end\n' +
        'return result',
    )
  })

  it('decodes escaped tabs and quotes in backend code payloads', () => {
    expect(
      extractCodeText('lua{local n = tonumber(wf.vars.ws)\\n\\tif n == nil then return nil end\\nreturn n + 1}lua'),
    ).toBe(
      'local n = tonumber(wf.vars.ws)\n' +
        'if n == nil then\n' +
        '  return nil\n' +
        'end\n' +
        'return n + 1',
    )
  })

  it('splits compact lua wrappers into multiple readable lines', () => {
    expect(
      extractCodeText(
        'lua{function fizzbuzz(n) for i = 1, n do if i % 3 == 0 and i % 5 == 0 then print("FizzBuzz") elseif i % 3 == 0 then print("Fizz") elseif i % 5 == 0 then print("Buzz") else print(i) end end return n end}lua',
      ),
    ).toBe(
      'function fizzbuzz(n)\n' +
        '  for i = 1, n do\n' +
        '    if i % 3 == 0 and i % 5 == 0 then\n' +
        '      print("FizzBuzz")\n' +
        '    elseif i % 3 == 0 then\n' +
        '      print("Fizz")\n' +
        '    elseif i % 5 == 0 then\n' +
        '      print("Buzz")\n' +
        '    else\n' +
        '      print(i)\n' +
        '    end\n' +
        '  end\n' +
        '  return n\n' +
        'end',
    )
  })
})
