require 'rails_helper'

describe BlogPost, type: :model do
  let(:blog_post) { create(:blog_post) }

  context '#generate_slug' do
    let(:title) { blog_post.title }
    let(:slug) { title.gsub(/[^a-zA-Z\d\s]/, '').gsub(' ', '-').downcase }
    let(:blog_post_with_same_title) { create(:blog_post, title: title) }
    let(:another_blog_post_with_same_title) { create(:blog_post, title: blog_post_with_same_title.title) }

    it 'should generate an appropriately formatted slug' do
      expect(blog_post.slug).to eq(slug)
    end

    it 'should add append a number if the slug already exists' do
      expect(blog_post_with_same_title.slug).to eq("#{slug}-2")
    end

    it 'should increment the appended number of the slug that already exists' do
      expect(another_blog_post_with_same_title.slug).to eq("#{slug}-3")
    end
  end
end
