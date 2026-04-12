# MWS Octapi rules

- Use only `wf.vars.<name>` and `wf.initVariables.<name>` variable access.
- Never use JsonPath like `$.field`.
- Forbidden in generated code: `os.time()`, `os.date()`, `require()`, `loadstring()`, `io.*`.
- Every generated Lua snippet must end with `return <value>`.
- Wrap generated Lua in the transport format `{"key":"lua{...}lua"}`.
