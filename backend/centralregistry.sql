-- This script creates the central registry for all AI agents on the platform.
-- It is designed to be a scalable foundation for the AI Gateway.
CREATE TABLE ai_agents (
    -- agent_id: A unique, auto-incrementing integer to serve as the primary key.
    agent_id SERIAL PRIMARY KEY,

    -- agent_slug: A unique, URL-friendly text identifier for the agent (e.g., "presentation-bot").
    -- This will be used in the API route /api/v1/chat/:agent_slug.
    agent_slug TEXT NOT NULL UNIQUE,

    -- agent_name: A human-readable name for the agent (e.g., "Presentation Support Bot").
    agent_name TEXT,

    -- do_agent_uuid: The unique identifier for the agent on the DigitalOcean GenAI Platform.
    -- This UUID is used by the backend to proxy requests to the correct DO agent.
    do_agent_uuid TEXT NOT NULL,
    
    -- createdAt: A timestamp that automatically records when the agent was added.
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Add a comment to the table for future reference
COMMENT ON TABLE ai_agents IS 'Central registry for all AI agents, linking internal slugs to DigitalOcean agent UUIDs. See Task 10.2.';
