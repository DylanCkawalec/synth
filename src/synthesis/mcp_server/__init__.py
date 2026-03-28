def main() -> None:
    from synthesis.mcp_server.server import mcp
    mcp.run(transport="stdio")
